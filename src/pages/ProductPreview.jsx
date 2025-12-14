import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const ProductPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!API_BASE) {
      console.error("REACT_APP_API_BASE_URL が設定されていません");
      return;
    }

    fetch(`${API_BASE}/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data.product))
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) return <p>読み込み中...</p>;

  return (
    <div style={{ padding: "20px" }}>
      {/* 戻るボタン */}
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "15px",
          padding: "6px 12px",
          cursor: "pointer",
          borderRadius: "6px",
          border: "1px solid #ccc",
          background: "white",
        }}
      >
        ← 戻る
      </button>

      <h1>プレビュー</h1>

      <img
        src={product.imageUrl}
        alt={product.title}
        style={{ width: "40%", borderRadius: "8px", marginTop: "10px" }}
      />

      <h2 style={{ marginTop: "15px" }}>{product.title}</h2>
      <p style={{ color: "#e60033", fontWeight: "bold" }}>{product.price}円</p>

      <p style={{ marginTop: "10px" }}>{product.description}</p>

      {/* 編集ボタン（売り切れは編集不可） */}
      {product.status === "sold_out" ? (
        <button
          disabled
          style={{
            marginTop: "20px",
            background: "#999",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: "not-allowed",
            opacity: 0.7,
            width: "100%",
          }}
        >
          SOLD OUT（編集不可）
        </button>
      ) : (
        <button
          onClick={() => navigate(`/products/${product.id}/edit`)}
          style={{
            marginTop: "20px",
            background: "#007bff",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          編集する
        </button>
      )}
    </div>
  );
};

export default ProductPreview;
