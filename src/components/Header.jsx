import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const ICONS = [
  "🙂",
  "😎",
  "😊",
  "🤖",
  "🐶",
  "🐱",
  "🦊",
  "🐼",
  "🦁",
  "🐸",
  "🐵",
  "🦄",
  "🐯",
  "🐨",
];

const Header = () => {
  const { firebaseUser, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [icon, setIcon] = useState(() => {
    if (!firebaseUser) return "🙂";
    return localStorage.getItem(`userIcon_${firebaseUser.uid}`) || "🙂";
  });

  const handleIconSelect = (newIcon) => {
    if (!firebaseUser) return;
    setIcon(newIcon);
    localStorage.setItem(`userIcon_${firebaseUser.uid}`, newIcon);
  };

  const handleSearch = () => {
    if (!keyword) return;
    navigate(`/search?keyword=${keyword}`);
  };

  // ローディング中は何も表示しない（エラー防止）
  if (loading) return null;

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        padding: "16px 16px",
        borderBottom: "1px solid #ddd",
        position: "fixed",
        top: 0,
        background: "#fff",
        zIndex: 1000,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        width: "100%",
        flexWrap: "wrap",
      }}
    >
      <div
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          gap: "8px",
        }}
      >
        <img
          src="/logo192.png"
          alt="EaseBuy logo"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "6px",
          }}
        />
        <h2 style={{ margin: 0 }}>EaseBuy</h2>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          gap: "8px",
          marginLeft: "16px",
          flexWrap: "nowrap",
        }}
      >
        <input
          type="text"
          placeholder="キーワード検索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{
            padding: "8px",
            width: "100%",
            maxWidth: "480px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={handleSearch}
          style={{ padding: "8px 14px", whiteSpace: "nowrap" }}
        >
          検索
        </button>
      </div>

      <div
        style={{
          marginLeft: "auto",
          marginTop: "0px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {firebaseUser && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <select
              value={icon}
              onChange={(e) => handleIconSelect(e.target.value)}
              style={{
                fontSize: "18px",
                borderRadius: "6px",
                padding: "2px 4px",
                cursor: "pointer",
              }}
            >
              {ICONS.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
            <span
              style={{
                fontSize: "14px",
                color: "#555",
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}
            >
              {firebaseUser.displayName || firebaseUser.email} さん
            </span>
          </div>
        )}

        {firebaseUser ? (
          <button
            onClick={async () => {
              const ok = window.confirm("ログアウトしますか？");
              if (!ok) return;
              await logout();
              alert("ログアウトしました");
              navigate("/");
            }}
            style={{
              padding: "8px 14px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            ログアウト
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "8px 14px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            ログイン
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
