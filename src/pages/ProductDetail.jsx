import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fireAuth } from "../firebase"; // ← 追加！

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  // 🔥 購入処理：ここを修正！
  const handlePurchase = async () => {
    try {
      const res = await fetch("http://localhost:8080/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: Number(id),
          buyerId: 1,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("購入成功:", data);
        navigate("/purchase-complete");
      } else {
        alert("購入に失敗しました: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("購入処理中にエラーが発生しました");
    }
  };

  useEffect(() => {
    fetch(`http://localhost:8080/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data.product))
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) return <p>読み込み中...</p>;

  return (
    <div
      style={{
        display: "block",
        height: "calc(100vh - 120px)",
        position: "relative",
      }}
    >
      {/* 左固定エリア */}
      <div
        style={{
          width: "50%",
          height: "calc(100vh - 120px)",
          position: "fixed",
          top: "120px",
          left: 0,
          overflow: "hidden",
          padding: "0 16px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ marginBottom: "15px", alignSelf: "flex-start" }}
        >
          ← 戻る
        </button>

        <h1 style={{ textAlign: "center" }}>{product.title}</h1>

        <div style={{ width: "100%", position: "relative", marginTop: "10px" }}>
          {product.status === "sold_out" && (
            <div
              style={{
                position: "absolute",
                top: "8px",
                left: "8px",
                backgroundColor: "rgba(230,0,51,0.9)",
                color: "white",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "bold",
                zIndex: 10,
              }}
            >
              売り切れ
            </div>
          )}
          <img
            src={product.imageUrl || "https://placehold.jp/300x300.png"}
            alt={product.title}
            style={{ width: "100%", maxHeight: "45vh", objectFit: "contain" }}
          />
        </div>
      </div>

      {/* 右スクロールエリア */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: "110px",
          width: "50%",
          height: "calc(100vh - 120px)",
          overflowY: "auto",
          padding: "0 16px 80px",
          boxSizing: "border-box",
        }}
      >
        <p style={{ marginTop: "6px", fontSize: "14px", color: "#555" }}>
          カテゴリ: {product.category} / 状態: {product.status}
        </p>

        <h2 style={{ marginTop: "15px", color: "#e60033" }}>
          {product.price}円
        </h2>

        <p style={{ marginTop: "10px", whiteSpace: "pre-line" }}>
          {product.description}
        </p>
      </div>

      {/* 画面下の購入ボタン（全幅固定） */}
      <button
        onClick={product.status === "sold_out" ? null : handlePurchase}
        disabled={product.status === "sold_out"}
        style={{
          position: "fixed",
          left: 0,
          bottom: 0,
          width: "100%",
          backgroundColor: product.status === "sold_out" ? "#aaa" : "#e60033",
          color: "white",
          border: "none",
          padding: "16px 0",
          fontSize: "18px",
          cursor: product.status === "sold_out" ? "not-allowed" : "pointer",
          opacity: product.status === "sold_out" ? 0.6 : 1,
          zIndex: 2000,
        }}
      >
        {product.status === "sold_out" ? "売り切れ" : "購入する"}
      </button>
    </div>
  );
};

export default ProductDetail;
