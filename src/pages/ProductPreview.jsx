import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CATEGORY_LABELS,
  SUB_CATEGORY_LABELS,
} from "../constants/categoryLabels";

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
    <div
      style={{
        display: "block",
        height: "calc(100vh - 120px)",
        position: "relative",
      }}
    >
      {/* 左側（画像エリア） */}
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
          style={{
            alignSelf: "flex-start",
            marginBottom: "12px",
            background: "none",
            border: "none",
            color: "#1976d2",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← 戻る
        </button>
        <div
          style={{
            width: "80%",
            maxWidth: "320px",
            aspectRatio: "1 / 1",
            marginBottom: "24px",
          }}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              style={{
                width: "100%",
                height: "100%",
                aspectRatio: "1 / 1",
                objectFit: "cover",
                borderRadius: "12px",
                border: "1px solid #eee",
                background: "#fafafa",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                aspectRatio: "1 / 1",
                borderRadius: "12px",
                border: "1px dashed #ddd",
                background: "#fafafa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: "14px",
              }}
            >
              画像は登録されていません
            </div>
          )}
        </div>
      </div>

      {/* 右側（情報エリア） */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: "110px",
          width: "50%",
          height: "calc(100vh - 180px)",
          overflowY: "auto",
          padding: "0 12px 140px",
          boxSizing: "border-box",
        }}
      >
        <p
          style={{
            color: "#888",
            fontSize: "13px",
            marginBottom: "12px",
          }}
        >
          {CATEGORY_LABELS[product.category] ?? product.category}
          {product.subCategory
            ? ` / ${
                SUB_CATEGORY_LABELS[product.subCategory] ?? product.subCategory
              }`
            : ""}
        </p>

        <p
          style={{
            color: "#e60033",
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "16px",
          }}
        >
          {product.price}円
        </p>

        <div
          style={{
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
            fontSize: "14px",
            marginBottom: "24px",
          }}
        >
          {product.description}
        </div>
      </div>

      {/* 下部アクション */}
      <div
        style={{
          position: "fixed",
          left: 0,
          bottom: 0,
          width: "100%",
          zIndex: 2000,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 20px",
            background:
              "linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.7))",
            backdropFilter: "blur(6px)",
          }}
        >
          {product.status === "sold_out" ? (
            <button
              disabled
              style={{
                background: "#b0b0b0",
                color: "white",
                padding: "12px 32px",
                border: "none",
                borderRadius: "999px",
                cursor: "not-allowed",
                fontSize: "14px",
                opacity: 0.8,
              }}
            >
              SOLD OUT
            </button>
          ) : (
            <button
              onClick={() => navigate(`/products/${product.id}/edit`)}
              style={{
                background: "#1976d2",
                color: "white",
                padding: "12px 36px",
                border: "none",
                borderRadius: "999px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                boxShadow: "0 6px 16px rgba(25, 118, 210, 0.35)",
              }}
            >
              編集する
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
