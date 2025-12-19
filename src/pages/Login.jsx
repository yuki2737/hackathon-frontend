import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { fireAuth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
console.log("API_BASE =", API_BASE);

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  // 新規登録
  const register = async () => {
    const ok = window.confirm("新規会員登録を行います。本当によろしいですか？");
    if (!ok) return;
    setIsRegistering(true);

    if (!API_BASE) {
      alert("API_BASE is not defined");
      setIsRegistering(false);
      return;
    }
    if (!name.trim()) {
      alert("ユーザー名を入力してください");
      setIsRegistering(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        fireAuth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      // Firebase Auth に displayName を設定
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          name,
          email,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`バックエンド登録失敗: ${res.status} ${text}`);
      }

      alert("登録完了しました");
      navigate("/");
    } catch (err) {
      alert("登録に失敗しました: " + err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  // ログイン
  const login = async () => {
    const ok = window.confirm("ログインを行います。本当によろしいですか？");
    if (!ok) return;
    setIsLoggingIn(true);

    if (!API_BASE) {
      alert("API_BASE is not defined");
      setIsLoggingIn(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(fireAuth, email, password);

      alert("ログイン完了");
      navigate("/");
    } catch (err) {
      alert("ログイン失敗: " + err.message);
    } finally {
      setIsLoggingIn(false);
    }
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

      {isRegistering && (
        <p
          style={{ textAlign: "center", color: "#28a745", marginBottom: "8px" }}
        >
          会員登録を行っています...
        </p>
      )}
      {isLoggingIn && (
        <p
          style={{ textAlign: "center", color: "#007bff", marginBottom: "8px" }}
        >
          ログインを行っています...
        </p>
      )}

      <button
        onClick={register}
        disabled={isRegistering || isLoggingIn}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          background: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          opacity: isRegistering || isLoggingIn ? 0.6 : 1,
        }}
      >
        新規登録
      </button>

      <button
        onClick={login}
        disabled={isLoggingIn || isRegistering}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          opacity: isLoggingIn || isRegistering ? 0.6 : 1,
        }}
      >
        ログイン
      </button>
    </div>
  );
};

export default Login;
