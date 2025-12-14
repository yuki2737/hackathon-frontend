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
    // Firebase のログイン状態を監視
    const unsubscribe = onAuthStateChanged(fireAuth, async (currentUser) => {
      setFirebaseUser(currentUser);

      // 未ログインなら appUser をクリアして終了
      if (!currentUser) {
        setAppUser(null);
        setLoading(false);
        return;
      }

      // ログイン中：バックエンドからアプリ用ユーザーを取得
      try {
        if (!API_BASE) {
          throw new Error("REACT_APP_API_BASE_URL が設定されていません");
        }

        const res = await fetch(`${API_BASE}/auth/user?uid=${currentUser.uid}`);
        if (!res.ok) {
          // 404 の場合は「Firebaseはログイン済だがDB未登録」などが起きうる
          const text = await res.text().catch(() => "");
          throw new Error(`アプリ用ユーザー取得失敗: ${res.status} ${text}`);
        }
        const data = await res.json();
        setAppUser(data);
      } catch (e) {
        console.error(e);
        setAppUser(null);
      } finally {
        setLoading(false);
      }
    });

    // クリーンアップ
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
