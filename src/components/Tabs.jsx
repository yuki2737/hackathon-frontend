import { Link, useLocation } from "react-router-dom";

const Tabs = () => {
  const location = useLocation();

  const activeStyle = {
    fontWeight: "bold",
    color: "#e60033",
    borderBottom: "2px solid #e60033",
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #e5e5e5",
        position: "fixed",
        top: 70,
        left: 0,
        width: "100%",
        backgroundColor: "#ffffff",
        zIndex: 1000,
        height: 44,
      }}
    >
      <Link
        to="/"
        style={{
          flex: 1,
          textAlign: "center",
          lineHeight: "44px",
          textDecoration: "none",
          color: location.pathname === "/" ? "#e60033" : "#555",
          fontWeight: location.pathname === "/" ? "600" : "400",
          borderBottom:
            location.pathname === "/"
              ? "2px solid #e60033"
              : "2px solid transparent",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            gap: 6,
          }}
        >
          <span style={{ fontSize: 18 }}>🏠</span>
          <span>ホーム</span>
        </div>
      </Link>

      <Link
        to="/search"
        style={{
          flex: 1,
          textAlign: "center",
          lineHeight: "44px",
          textDecoration: "none",
          color: location.pathname === "/search" ? "#e60033" : "#555",
          fontWeight: location.pathname === "/search" ? "600" : "400",
          borderBottom:
            location.pathname === "/search"
              ? "2px solid #e60033"
              : "2px solid transparent",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            gap: 6,
          }}
        >
          <span style={{ fontSize: 18 }}>🔍</span>
          <span>カテゴリ/検索</span>
        </div>
      </Link>

      <Link
        to="/threads"
        style={{
          flex: 1,
          textAlign: "center",
          lineHeight: "44px",
          textDecoration: "none",
          color: location.pathname === "/threads" ? "#e60033" : "#555",
          fontWeight: location.pathname === "/threads" ? "600" : "400",
          borderBottom:
            location.pathname === "/threads"
              ? "2px solid #e60033"
              : "2px solid transparent",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            gap: 6,
          }}
        >
          <span style={{ fontSize: 18 }}>💬</span>
          <span>DM一覧</span>
        </div>
      </Link>

      <Link
        to="/mypage"
        style={{
          flex: 1,
          textAlign: "center",
          lineHeight: "44px",
          textDecoration: "none",
          color: location.pathname === "/mypage" ? "#e60033" : "#555",
          fontWeight: location.pathname === "/mypage" ? "600" : "400",
          borderBottom:
            location.pathname === "/mypage"
              ? "2px solid #e60033"
              : "2px solid transparent",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            gap: 6,
          }}
        >
          <span style={{ fontSize: 18 }}>👤</span>
          <span>マイページ</span>
        </div>
      </Link>
    </nav>
  );
};

export default Tabs;
