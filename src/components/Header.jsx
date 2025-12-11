import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    if (!keyword) return;
    navigate(`/search?keyword=${keyword}`);
  };

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
      }}
    >
      <h2 style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        Hackathon Market
      </h2>

      <input
        type="text"
        placeholder="キーワード検索"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{
          marginLeft: "16px",
          padding: "8px",
          width: "50%",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={handleSearch}
        style={{ marginLeft: "10px", padding: "8px 14px" }}
      >
        検索
      </button>
    </header>
  );
};

export default Header;
