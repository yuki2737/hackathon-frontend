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

      try {
        // ① まずユーザー取得
        let res = await fetch(`${API_BASE}/auth/user?uid=${currentUser.uid}`);

        // ② DB未登録なら自動登録
        if (res.status === 404) {
          const registerRes = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid: currentUser.uid,
              email: currentUser.email,
              name: currentUser.displayName || "user",
            }),
          });

          if (!registerRes.ok) {
            const text = await registerRes.text().catch(() => "");
            throw new Error(`自動登録失敗: ${registerRes.status} ${text}`);
          }

          // 再取得
          res = await fetch(`${API_BASE}/auth/user?uid=${currentUser.uid}`);
        }

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`ユーザー取得失敗: ${res.status} ${text}`);
        }

        const data = await res.json();
        setAppUser(data);
      } catch (e) {
        console.error("AuthProvider error:", e);
        setAppUser(null);
      } finally {
        setLoading(false);
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
