import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const CreateProduct = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      alert("ログインしてください");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          price: Number(price),
          imageUrl,
          description,
          category: "fashion",
          uid: user.uid,
        }),
      });

      const data = await res.json();
      alert("出品が完了しました！");
      navigate("/");
      console.log(data);
    } catch (err) {
      console.error(err);
      alert("出品に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>出品ページ</h1>

      <input
        type="text"
        placeholder="商品名"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="number"
        placeholder="価格"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <input
        type="text"
        placeholder="画像URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />

      <textarea
        placeholder="商品説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button onClick={handleSubmit}>出品</button>
    </div>
  );
};

export default CreateProduct;
