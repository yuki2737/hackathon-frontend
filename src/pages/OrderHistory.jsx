import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fireAuth } from "../firebase";

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    //const uid = fireAuth.currentUser?.uid;
    //if (!uid) return;
    //一時的に固定ユーザーIDを使う
    const uid = 1;
    fetch(`http://localhost:8080/orders?userId=${uid}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("OrderHistory response:", data);
        setOrders(data.orders || []);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1
        style={{
          position: "sticky",
          top: "110px",
          background: "#fff",
          padding: "10px 0",
          margin: 0,
          zIndex: 500,
          borderBottom: "1px solid #ddd",
        }}
      >
        購入履歴
      </h1>
      <button
        onClick={() => navigate("/mypage")}
        style={{
          position: "fixed",
          top: "130px",
          marginLeft: "auto",
          background: "#007bff",
          color: "white",
          border: "none",
          padding: "8px 14px",
          borderRadius: "6px",
          cursor: "pointer",
          zIndex: 600,
          right: "20px",
        }}
      >
        マイページに戻る
      </button>

      {orders.length === 0 ? (
        <p>購入履歴はありません。</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/products/${order.productId}`)}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <img
                src={
                  order.product?.imageUrl || "https://placehold.jp/150x150.png"
                }
                alt={order.product?.title}
                style={{ width: "100%", borderRadius: "8px" }}
              />
              <h3 style={{ marginTop: "10px" }}>
                商品名: {order.product?.title}
              </h3>
              <p style={{ color: "#e60033", fontWeight: "bold" }}>
                料金: {order.product?.price}円
              </p>
              <small>
                購入日: {new Date(order.purchasedAt).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
