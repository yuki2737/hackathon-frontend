import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { fireAuth } from "./firebase";

export const LoginForm = () => {
  const [name, setName] = useState(""); // ←名前追加
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 新規登録
  const register = async () => {
    try {
      // Firebaseで登録
      const userCredential = await createUserWithEmailAndPassword(
        fireAuth,
        email,
        password
      );

      const uid = userCredential.user.uid; // Firebase UID

      console.log("Firebase UID:", uid); // ← ここ追加

      // MySQL側にユーザー情報保存
      await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          name,
          email,
          password, // ここも後で必要になるので送る準備（今はなくても動く）
        }),
      });

      alert("Firebase + MySQL 両方に登録できました！");
    } catch (err) {
      console.error(err);
      alert("登録に失敗しました: " + err.message);
    }
  };

  // ログイン
  const login = async () => {
    try {
      await signInWithEmailAndPassword(fireAuth, email, password);
      alert("ログイン完了");
    } catch (err) {
      alert("ログイン失敗: " + err.message);
    }
  };

  // ログアウト
  const logout = async () => {
    await signOut(fireAuth);
    alert("ログアウトしました");
  };

  return (
    <div>
      <h2>ログイン / 新規登録</h2>

      <input
        type="text"
        placeholder="ユーザー名"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={register}>新規登録</button>
      <button onClick={login}>ログイン</button>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
};
