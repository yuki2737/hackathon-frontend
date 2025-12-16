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
        justifyContent: "space-around",
        borderTop: "1px solid #ddd",
        padding: "10px 0",
        position: "fixed",
        top: 70,
        background: "white",
        zIndex: 10,
        width: "100%",
        zIndex: 1000,
      }}
    >
      <Link to="/" style={location.pathname === "/" ? activeStyle : {}}>
        ホーム
      </Link>
      <Link
        to="/search"
        style={location.pathname === "/search" ? activeStyle : {}}
      >
        カテゴリ/検索
      </Link>
      <Link
        to="/threads"
        style={location.pathname === "/threads" ? activeStyle : {}}
      >
        DM一覧
      </Link>
      <Link
        to="/mypage"
        style={location.pathname === "/mypage" ? activeStyle : {}}
      >
        マイページ
      </Link>
    </nav>
  );
};

export default Tabs;
