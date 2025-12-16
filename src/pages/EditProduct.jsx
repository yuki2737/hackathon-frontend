import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const SUB_CATEGORIES = {
  fashion: [
    { key: "tops", label: "トップス" },
    { key: "bottoms", label: "ボトムス" },
    { key: "shoes", label: "靴" },
    { key: "fashion_other", label: "ファッションその他" },
  ],
  electronics: [
    { key: "smartphone", label: "スマートフォン" },
    { key: "computer", label: "コンピューター" },
    { key: "audio", label: "オーディオ" },
    { key: "electronics_other", label: "家電・電子機器その他" },
  ],
  book: [
    { key: "novel", label: "小説" },
    { key: "comic", label: "コミック" },
    { key: "magazine", label: "雑誌" },
    { key: "book_other", label: "本その他" },
  ],
  hobby: [
    { key: "toy", label: "おもちゃ" },
    { key: "model", label: "模型" },
    { key: "collectible", label: "コレクション" },
    { key: "hobby_other", label: "ホビーその他" },
  ],
  sports: [
    { key: "equipment", label: "スポーツ用品" },
    { key: "clothing", label: "スポーツウェア" },
    { key: "accessory", label: "アクセサリー" },
    { key: "sports_other", label: "スポーツその他" },
  ],
  beauty: [
    { key: "skincare", label: "スキンケア" },
    { key: "makeup", label: "メイクアップ" },
    { key: "fragrance", label: "香水" },
    { key: "beauty_other", label: "美容その他" },
  ],
  lifestyle: [
    { key: "kitchen", label: "キッチン用品" },
    { key: "furniture", label: "家具" },
    { key: "decor", label: "インテリア" },
    { key: "lifestyle_other", label: "生活用品その他" },
  ],
  handmade: [
    { key: "jewelry", label: "アクセサリー" },
    { key: "clothing", label: "衣類" },
    { key: "craft", label: "クラフト" },
    { key: "handmade_other", label: "ハンドメイドその他" },
  ],
  kids: [
    { key: "clothing", label: "子供服" },
    { key: "toy", label: "おもちゃ" },
    { key: "baby_goods", label: "ベビー用品" },
    { key: "kids_other", label: "キッズその他" },
  ],
  pet: [
    { key: "food", label: "ペットフード" },
    { key: "accessory", label: "アクセサリー" },
    { key: "toys", label: "おもちゃ" },
    { key: "pet_other", label: "ペットその他" },
  ],
  food: [
    { key: "snack", label: "スナック" },
    { key: "beverage", label: "飲料" },
    { key: "ingredient", label: "食材" },
    { key: "food_other", label: "食品その他" },
  ],
  other: [{ key: "misc", label: "その他" }],
};

const CATEGORY_COLORS = {
  fashion: "#e91e63",
  electronics: "#3f51b5",
  book: "#795548",
  hobby: "#9c27b0",
  sports: "#2196f3",
  beauty: "#ff9800",
  lifestyle: "#009688",
  handmade: "#8bc34a",
  kids: "#ff5722",
  pet: "#607d8b",
  food: "#4caf50",
  other: "#9e9e9e",
};

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { firebaseUser, loading } = useAuth();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      alert("ログインしてください");
      navigate("/login");
      return;
    }

    fetch(`${API_BASE}/products/${id}`)
      .then((res) => res.json())
      .then(({ product }) => {
        setTitle(product.title);
        setPrice(product.price);
        setCategory(product.category);
        setSubCategory(product.subCategory);
        setDescription(product.description);
        setImageUrl(product.imageUrl || "");
        setPreviewUrl(product.imageUrl || "");
      });
  }, [id, firebaseUser, loading, navigate]);

  const handleGenerateDescription = async () => {
    if (!title.trim()) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/ai/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDescription(data.description);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || uploading) return;
    setUploading(true);
    try {
      const res = await fetch(`${API_BASE}/images/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          uid: firebaseUser.uid,
        }),
      });
      const data = await res.json();
      await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      setImageUrl(data.publicUrl);
      setPreviewUrl(data.publicUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    await fetch(`${API_BASE}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        price: Number(price),
        category,
        subCategory,
        description,
        imageUrl,
      }),
    });
    alert("更新しました");
    navigate("/mypage");
  };

  const handleDelete = async () => {
    if (!window.confirm("本当に削除しますか？")) return;
    await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
    navigate("/mypage");
  };

  return (
    <div
      style={{
        display: "block",
        height: "calc(100vh - 120px)",
        position: "relative",
      }}
    >
      {/* 左固定エリア（画像） */}
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
          style={{ marginBottom: "12px", alignSelf: "flex-start" }}
        >
          ← 戻る
        </button>

        <h1 style={{ fontSize: "18px", marginBottom: "8px" }}>商品編集</h1>

        <div
          style={{
            width: "80%",
            maxWidth: "320px",
            aspectRatio: "1 / 1",
            marginBottom: "24px",
          }}
        >
          {previewUrl ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                borderRadius: "8px",
                border: "1px solid #eee",
                backgroundColor: "#f5f5f5",
              }}
            >
              <img
                src={previewUrl}
                alt="プレビュー"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "8px",
                border: "1px dashed #ccc",
                backgroundColor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#777",
                fontSize: "14px",
              }}
            >
              画像は登録されていません
            </div>
          )}
        </div>

        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          style={{ marginBottom: "8px" }}
        />
        <button onClick={handleImageUpload} disabled={uploading}>
          {uploading ? "アップロード中..." : "画像をアップロード"}
        </button>
      </div>

      {/* 右スクロールエリア（編集フォーム） */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: "120px",
          width: "50%",
          height: "calc(100vh - 180px)",
          overflowY: "auto",
          padding: "0 16px 160px",
          boxSizing: "border-box",
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="商品名"
          style={{ width: "100%", marginBottom: "8px" }}
        />

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="価格"
          style={{ width: "100%", marginBottom: "12px" }}
        />

        {/* カテゴリー選択（日本語ラベル、CreateProductと同じUI） */}
        <div
          style={{ marginBottom: "12px", display: "flex", flexWrap: "wrap" }}
        >
          {[
            { key: "fashion", label: "ファッション" },
            { key: "electronics", label: "家電・電子機器" },
            { key: "book", label: "本・雑誌" },
            { key: "hobby", label: "ホビー" },
            { key: "sports", label: "スポーツ" },
            { key: "beauty", label: "美容" },
            { key: "lifestyle", label: "生活用品" },
            { key: "handmade", label: "ハンドメイド" },
            { key: "kids", label: "キッズ" },
            { key: "pet", label: "ペット" },
            { key: "food", label: "食品" },
            { key: "other", label: "その他" },
          ].map((c) => (
            <button
              key={c.key}
              onClick={() => {
                setCategory(c.key);
                setSubCategory("");
              }}
              style={{
                marginRight: "8px",
                marginBottom: "8px",
                borderRadius: "999px",
                padding: "6px 18px",
                border:
                  category === c.key
                    ? `2px solid ${CATEGORY_COLORS[c.key]}`
                    : "1px solid #ccc",
                background:
                  category === c.key ? CATEGORY_COLORS[c.key] : "#fff",
                color: category === c.key ? "#fff" : "#333",
                fontWeight: category === c.key ? "bold" : "normal",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* サブカテゴリー選択（CreateProductと同じUI） */}
        {category && (
          <div
            style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap" }}
          >
            {SUB_CATEGORIES[category].map((sc) => (
              <button
                key={sc.key}
                onClick={() => setSubCategory(sc.key)}
                style={{
                  marginRight: "8px",
                  marginBottom: "8px",
                  borderRadius: "999px",
                  padding: "5px 14px",
                  border:
                    subCategory === sc.key
                      ? `2px solid ${CATEGORY_COLORS[category]}`
                      : `1px solid ${CATEGORY_COLORS[category]}`,
                  background:
                    subCategory === sc.key ? CATEGORY_COLORS[category] : "#fff",
                  color:
                    subCategory === sc.key ? "#fff" : CATEGORY_COLORS[category],
                  fontWeight: subCategory === sc.key ? "bold" : "normal",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {sc.label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleGenerateDescription}
          disabled={generating}
          style={{ marginBottom: "8px" }}
        >
          {generating ? "生成中..." : "AIで説明文生成"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", minHeight: "140px", marginBottom: "16px" }}
        />

        {/* 必須項目バリデーション */}
        {(() => {
          const isFormValid =
            title.trim().length > 0 &&
            price !== "" &&
            Number(price) > 0 &&
            category &&
            subCategory &&
            description.trim().length > 0;
          return (
            <>
              {!isFormValid && (
                <div
                  style={{
                    color: "red",
                    fontSize: "13px",
                    marginBottom: "8px",
                  }}
                >
                  ※ 商品名・価格・カテゴリー・サブカテゴリー・説明は必須です
                </div>
              )}
              <button
                onClick={handleUpdate}
                style={{ marginRight: "8px" }}
                disabled={!isFormValid}
              >
                更新する
              </button>
              <button
                onClick={handleDelete}
                style={{ background: "red", color: "#fff" }}
              >
                削除する
              </button>
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default EditProduct;
