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
        position: "sticky",
        bottom: 0,
        background: "white",
        zIndex: 10,
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
        to="/ranking"
        style={location.pathname === "/ranking" ? activeStyle : {}}
      >
        ランキング
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
