import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  const fetchProducts = () => {
    const url = `http://localhost:8080/products`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log("API response:", data);
        setProducts(data.products || []);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>ホーム（商品一覧）</h1>

      {/* 🔹商品一覧 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "12px",
          marginTop: "20px",
        }}
      >
        {products.map((product) => (
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

      {/* 🔹出品ボタン */}
      <button
        onClick={() => navigate("/create")}
        style={{
          display: "block",
          margin: "20px auto 0",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
        }}
      >
        出品する
      </button>
    </div>
  );
};

export default Home;
