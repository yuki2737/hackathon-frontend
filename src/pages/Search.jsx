import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [results, setResults] = useState([]);

  // URLからkeyword取得
  const params = new URLSearchParams(location.search);
  const keyword = params.get("keyword") || "";

  useEffect(() => {
    if (!keyword) return;

    fetch(`http://localhost:8080/products?keyword=${keyword}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("search results:", data);
        setResults(data.products || []);
      })
      .catch((err) => console.error(err));
  }, [keyword]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>検索結果: "{keyword}"</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
          marginTop: "20px",
        }}
      >
        {results.length === 0 && <p>商品が見つかりません</p>}

        {results.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/products/${product.id}`)}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src={product.imageUrl || "https://placehold.jp/150x150.png"}
              alt={product.title}
              style={{ width: "100%", borderRadius: "8px" }}
            />
            <h3 style={{ marginTop: "10px" }}>{product.title}</h3>
            <p style={{ color: "#e60033", fontWeight: "bold" }}>
              {product.price}円
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
