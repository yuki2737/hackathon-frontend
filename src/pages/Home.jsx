import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CATEGORY_LABELS,
  SUB_CATEGORY_LABELS,
} from "../constants/categoryLabels";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    if (!API_BASE) {
      console.error("REACT_APP_API_BASE_URL が設定されていません");
      return;
    }

    setLoading(true);

    const url = `${API_BASE}/products`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("API response:", data);
        const shuffled = [...(data.products || [])];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setProducts(shuffled);
        setLoading(false);
      })
      .catch((err) => {
        console.error("商品取得エラー:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
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
        ホーム（商品一覧）
      </h1>

      {loading && (
        <p style={{ marginTop: "16px", color: "#666", fontSize: "14px" }}>
          商品を読み込んでいます。しばらくお待ちください…
        </p>
      )}

      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "8px",
            marginTop: "16px",
            alignItems: "stretch",
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              style={{
                border: "1px solid #ccc",
                padding: "8px",
                borderRadius: "10px",
                cursor: "pointer",
                opacity: product.status === "sold_out" ? 0.5 : 1,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                position: "relative",
                minWidth: 0,
              }}
            >
              {product.status === "sold_out" && (
                <div
                  style={{
                    position: "absolute",
                    top: "6px",
                    left: "6px",
                    backgroundColor: "rgba(230,0,51,0.9)",
                    color: "white",
                    padding: "3px 6px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  売り切れ
                </div>
              )}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                  borderRadius: "10px",
                  marginBottom: "6px",
                }}
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f5f5f5",
                      color: "#999",
                      fontSize: "12px",
                    }}
                  >
                    画像は登録されていません
                  </div>
                )}
              </div>
              <h3
                style={{
                  margin: "6px 0 4px",
                  fontSize: "13px",
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {product.title}
              </h3>
              <p
                style={{
                  color: "#e60033",
                  fontWeight: "bold",
                  margin: 0,
                  fontSize: "13px",
                }}
              >
                {Number(product.price).toLocaleString("ja-JP")}円
              </p>
              {(product.category || product.subCategory) && (
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "12px",
                    color: "#666",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {CATEGORY_LABELS[product.category] ?? product.category}
                  {product.subCategory
                    ? ` / ${
                        SUB_CATEGORY_LABELS[product.subCategory] ??
                        product.subCategory
                      }`
                    : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
