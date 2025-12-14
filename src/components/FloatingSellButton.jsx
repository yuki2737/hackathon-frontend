import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const FloatingSellButton = () => {
  const navigate = useNavigate();
  const { firebaseUser, loading } = useAuth();

  return (
    <button
      onClick={() => {
        if (loading) return;
        if (!firebaseUser) {
          alert("出品にはログインが必要です");
          navigate("/login");
          return;
        }
        navigate("/create");
      }}
      style={{
        position: "fixed",
        bottom: "90px",
        right: "24px",
        padding: "14px 20px",
        backgroundColor: "#ff3b30",
        color: "white",
        borderRadius: "50px",
        border: "none",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        zIndex: 2000,
      }}
    >
      ＋ 出品
    </button>
  );
};

export default FloatingSellButton;
