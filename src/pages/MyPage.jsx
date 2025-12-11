import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fireAuth } from "../firebase";
import { useAuth } from "../auth/AuthProvider";

const MyPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    //const uid = fireAuth.currentUser?.uid;

    //if (!uid) return;
    //一時的に固定ユーザーIDを使う
    const uid = 1;
    fetch(`http://localhost:8080/products?user=${uid}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("MyPage response:", data);
        setProducts(data.products || []);
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
        マイページ（出品一覧）
      </h1>
      <button
        onClick={() => navigate("/orders")}
        style={{
          position: "fixed",
          top: "130px",
          right: "20px",
          padding: "8px 14px",
          zIndex: 600,
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        購入履歴を見る
      </button>

      {products.length === 0 ? (
        <p>まだ出品した商品はありません。</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}/preview`)}
              style={{
                position: "relative",
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {product.status === "sold_out" && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: "bold",
                    borderRadius: "8px",
                  }}
                >
                  SOLD OUT
                </div>
              )}
              <img
                src={product.imageUrl || "https://placehold.jp/150x150.png"}
                alt={product.title}
                style={{ width: "100%", borderRadius: "8px" }}
              />
              <h3 style={{ marginTop: "10px" }}>{product.title}</h3>
              <p style={{ color: "#e60033", fontWeight: "bold" }}>
                {product.price}円
              </p>
              {/* ▼ 出品日を表示 */}
              <small style={{ color: "#555" }}>
                出品日: {new Date(product.createdAt).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPage;
