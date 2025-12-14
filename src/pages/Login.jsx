import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { fireAuth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
console.log("API_BASE =", API_BASE);

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 新規登録
  const register = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        fireAuth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          name,
          email,
        }),
      });

      alert("Firebase + MySQL 両方に登録できました！");
      navigate("/");
    } catch (err) {
      alert("登録に失敗しました: " + err.message);
    }
  };

  // ログイン
  const login = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        fireAuth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      // アプリ用ユーザー取得
      const res = await fetch(`${API_BASE}/auth/user?uid=${uid}`);
      if (!res.ok) {
        throw new Error("ユーザー情報の取得に失敗しました");
      }
      const appUser = await res.json();
      console.log("Logged in app user:", appUser);

      alert("ログイン完了");
      navigate("/");
    } catch (err) {
      alert("ログイン失敗: " + err.message);
    }
  };

  // ログアウト
  const logout = async () => {
    await signOut(fireAuth);
    alert("ログアウトしました");
    navigate("/");
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        padding: "24px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        background: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        ログイン / 新規登録
      </h2>

      <label>ユーザー名</label>
      <input
        type="text"
        placeholder="ユーザー名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: "8px", margin: "8px 0" }}
      />

      <label>メールアドレス</label>
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: "8px", margin: "8px 0" }}
      />

      <label>パスワード</label>
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: "8px", margin: "8px 0" }}
      />

      <button
        onClick={register}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          background: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        新規登録
      </button>

      <button
        onClick={login}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ログイン
      </button>

      <button
        onClick={logout}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          background: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ログアウト
      </button>
    </div>
  );
};

export default Login;
