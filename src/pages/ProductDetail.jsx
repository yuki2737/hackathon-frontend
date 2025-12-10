import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  const handlePurchase = () => {
    navigate(`/purchase-complete`);
  };

  useEffect(() => {
    fetch(`http://localhost:8080/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data.product))
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) return <p>読み込み中...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "15px" }}>
        ← 戻る
      </button>

      <h1>{product.title}</h1>
      <p style={{ marginTop: "6px", fontSize: "14px", color: "#555" }}>
        カテゴリ: {product.category} / 状態: {product.status}
      </p>

      <img
        src={product.imageUrl || "https://placehold.jp/300x300.png"}
        alt={product.title}
        style={{ width: "40%", borderRadius: "8px", marginTop: "10px" }}
      />

      <h2 style={{ marginTop: "15px", color: "#e60033" }}>{product.price}円</h2>

      <p style={{ marginTop: "10px" }}>{product.description}</p>

      <button
        onClick={handlePurchase}
        style={{
          marginTop: "20px",
          backgroundColor: "#e60033",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          width: "100%",
        }}
      >
        購入する
      </button>
    </div>
  );
};

export default ProductDetail;
