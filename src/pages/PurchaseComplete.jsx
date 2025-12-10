import { useNavigate } from "react-router-dom";

const PurchaseComplete = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>購入ありがとうございました！</h1>
      <p style={{ marginTop: "12px", color: "#555" }}>
        購入が正常に完了しました。
      </p>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "24px",
          backgroundColor: "#e60033",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          width: "80%",
        }}
      >
        ホームに戻る
      </button>

      <button
        onClick={() => navigate("/orders")}
        style={{
          marginTop: "12px",
          backgroundColor: "#555",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          width: "80%",
        }}
      >
        購入履歴を見る
      </button>
    </div>
  );
};

export default PurchaseComplete;
