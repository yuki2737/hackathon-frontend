import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    title: "",
    price: "",
    description: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetch(`http://localhost:8080/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleUpdate = () => {
    fetch(`http://localhost:8080/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
      .then((res) => res.json())
      .then(() => {
        alert("商品を更新しました");
        navigate("/mypage");
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = () => {
    if (!window.confirm("本当に削除しますか？")) return;

    fetch(`http://localhost:8080/products/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        alert("商品を削除しました");
        navigate("/mypage");
      })
      .catch((err) => console.error(err));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>商品編集</h1>

      <input
        type="text"
        placeholder="タイトル"
        value={product.title}
        onChange={(e) => setProduct({ ...product, title: e.target.value })}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />

      <input
        type="number"
        placeholder="価格"
        value={product.price}
        onChange={(e) =>
          setProduct({ ...product, price: Number(e.target.value) })
        }
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />

      <textarea
        placeholder="説明文"
        value={product.description}
        onChange={(e) =>
          setProduct({ ...product, description: e.target.value })
        }
        style={{
          display: "block",
          marginBottom: "10px",
          width: "100%",
          height: "100px",
        }}
      />

      <input
        type="text"
        placeholder="画像URL"
        value={product.imageUrl}
        onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />

      <button
        onClick={handleUpdate}
        style={{ width: "100%", marginBottom: "14px" }}
      >
        更新する
      </button>

      <button
        onClick={handleDelete}
        style={{ width: "100%", color: "white", background: "red" }}
      >
        削除する
      </button>
    </div>
  );
};

export default EditProduct;
