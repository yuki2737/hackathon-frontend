import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fireAuth } from "../firebase";

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const uid = fireAuth.currentUser?.uid;
    if (!uid) return;

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
      <h1>購入履歴</h1>

      {orders.length === 0 ? (
        <p>購入履歴はありません。</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
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
              <h3 style={{ marginTop: "10px" }}>{order.product?.title}</h3>
              <p style={{ color: "#e60033", fontWeight: "bold" }}>
                {order.product?.price}円
              </p>
              <small>
                購入日: {new Date(order.createdAt).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      )}

      <button style={{ marginTop: "20px" }} onClick={() => navigate("/mypage")}>
        マイページに戻る
      </button>
    </div>
  );
};

export default OrderHistory;
