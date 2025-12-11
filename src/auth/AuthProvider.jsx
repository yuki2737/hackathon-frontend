import { createContext, useContext, useEffect, useState } from "react";
import { fireAuth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// --------------------
// Context 作成（初期値 null → 空オブジェクト {} に変更）
// --------------------
const AuthContext = createContext({
  user: null,
  loading: true,
  logout: () => {},
});

// --------------------
// Provider コンポーネント
// --------------------
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Firebaseユーザー
  const [loading, setLoading] = useState(true); // 読込中フラグ

  useEffect(() => {
    // Firebase のログイン状態を監視
    const unsubscribe = onAuthStateChanged(fireAuth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // クリーンアップ
    return () => unsubscribe();
  }, []);

  // ログアウト処理
  const logout = async () => {
    await signOut(fireAuth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --------------------
// Context を簡単に使える Hook
// --------------------
export const useAuth = () => useContext(AuthContext);
