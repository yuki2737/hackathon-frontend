import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fireAuth } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// --------------------
// Context 作成（firebaseUser と appUser を分離）
// --------------------
const AuthContext = createContext({
  firebaseUser: null,
  appUser: null,
  loading: true,
  logout: () => {},
  refreshAppUser: async () => {},
});

// --------------------
// Provider コンポーネント
// --------------------
export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null); // Firebaseユーザー
  const [appUser, setAppUser] = useState(null); // MySQL側（アプリ用）ユーザー
  const [loading, setLoading] = useState(true); // 読込中フラグ

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireAuth, async (currentUser) => {
      setFirebaseUser(currentUser);

      if (!currentUser) {
        setAppUser(null);
        setLoading(false);
        return;
      }

      if (!API_BASE) {
        console.error("REACT_APP_API_BASE_URL が設定されていません");
        setAppUser(null);
        setLoading(false);
        return;
      }

      let didSetLoading = false;
      try {
        // ① まず取得を試す
        const res = await fetch(`${API_BASE}/auth/user?uid=${currentUser.uid}`);

        if (res.status === 404) {
          // ② 未登録は想定内 → 自動登録
          const registerRes = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid: currentUser.uid,
              name: currentUser.displayName || "No Name",
              email: currentUser.email,
            }),
          });

          if (!registerRes.ok) {
            const text = await registerRes.text().catch(() => "");
            throw new Error(`自動登録失敗: ${registerRes.status} ${text}`);
          }

          // ③ 登録後に再取得
          const retryRes = await fetch(
            `${API_BASE}/auth/user?uid=${currentUser.uid}`
          );
          if (!retryRes.ok) {
            const text = await retryRes.text().catch(() => "");
            throw new Error(
              `登録後ユーザー取得失敗: ${retryRes.status} ${text}`
            );
          }

          const retryData = await retryRes.json();
          setAppUser(retryData);
        } else if (res.ok) {
          // ④ 既存ユーザー
          const data = await res.json();
          setAppUser(data);
        } else {
          const text = await res.text().catch(() => "");
          throw new Error(`ユーザー取得失敗: ${res.status} ${text}`);
        }
      } catch (e) {
        // 404はcatchされない
        console.error("AuthProvider error:", e);
        setAppUser(null);
      } finally {
        if (!didSetLoading) {
          setLoading(false);
          didSetLoading = true;
        }
      }
    });

    return () => unsubscribe();
  }, [API_BASE]);

  // ログアウト処理
  const logout = async () => {
    await signOut(fireAuth);
    setFirebaseUser(null);
    setAppUser(null);
  };

  const refreshAppUser = async () => {
    if (!firebaseUser) {
      setAppUser(null);
      return;
    }
    if (!API_BASE) {
      console.error("REACT_APP_API_BASE_URL が設定されていません");
      setAppUser(null);
      return;
    }

    const res = await fetch(`${API_BASE}/auth/user?uid=${firebaseUser.uid}`);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`アプリ用ユーザー取得失敗: ${res.status} ${text}`);
    }
    const data = await res.json();
    setAppUser(data);
  };

  const value = useMemo(
    () => ({ firebaseUser, appUser, loading, logout, refreshAppUser }),
    [firebaseUser, appUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --------------------
// Context を簡単に使える Hook
// --------------------
export const useAuth = () => useContext(AuthContext);
