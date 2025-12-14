import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const Header = () => {
  const { firebaseUser, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

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
        padding: "12px 16px",
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
      <h2 style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        Hackathon Market
      </h2>

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

      {/* 右端に配置 */}
      <div style={{ marginLeft: "auto", marginTop: "8px" }}>
        {firebaseUser && (
          <span
            style={{
              marginRight: "12px",
              fontSize: "14px",
              color: "#555",
              fontWeight: "bold",
            }}
          >
            {firebaseUser.email} さん
          </span>
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
