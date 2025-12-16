import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

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

const CreateProduct = () => {
  const navigate = useNavigate();
  const { firebaseUser, loading } = useAuth();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("fashion");
  const [subCategory, setSubCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const promptPresets = [
    "メルカリ向け・丁寧・初心者向け",
    "即売れ重視・短め・カジュアル",
    "高級感・信頼感重視",
  ];

  const handleGenerateDescription = async () => {
    if (!title.trim()) {
      alert("商品名を入力してください");
      return;
    }
    if (!API_BASE) {
      alert("API の接続先が設定されていません");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/ai/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, prompt }),
      });

      const data = await res.json();
      console.log("AI description response:", data);

      if (!res.ok) {
        throw new Error(data.error || "説明文生成に失敗しました");
      }

      setDescription(data.description);
    } catch (e) {
      console.error(e);
      setError(e.message || "説明文生成中にエラーが発生しました");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!firebaseUser) {
      alert("ログインしてください");
      navigate("/login");
      return;
    }
    if (!API_BASE) {
      alert("API の接続先が設定されていません");
      return;
    }
    // 必須項目: title, price, category, subCategory, description
    if (
      !title.trim() ||
      !price ||
      !category ||
      !subCategory ||
      !description.trim()
    ) {
      alert("商品名・価格・大カテゴリ・小カテゴリ・説明文は必須です");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price: Number(price),
          imageUrl, // imageUrl は任意
          description,
          category,
          subCategory,
          uid: firebaseUser.uid,
        }),
      });

      const data = await res.json();
      console.log("create product response:", data);

      if (!res.ok) {
        throw new Error(data.error || "出品に失敗しました");
      }

      alert("出品が完了しました！");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.message || "出品に失敗しました");
    }
  };

  // 画像アップロード用
  const handleImageUpload = async () => {
    if (loading) return;
    if (!API_BASE) {
      alert("API の接続先が設定されていません");
      return;
    }
    if (uploading) return;
    if (!selectedFile || !firebaseUser) return;
    if (!selectedFile.type) {
      throw new Error("画像の Content-Type を取得できません");
    }
    setUploading(true);
    setUploadError("");
    try {
      // 1. サイン付きURL取得
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
      if (!res.ok)
        throw new Error(
          data.error || "画像アップロード用URLの取得に失敗しました"
        );
      // 2. PUTでファイルアップロード
      const putRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type,
        },
        body: selectedFile,
      });

      console.log("PUT status:", putRes.status);
      console.log("PUT ok:", putRes.ok);

      if (!putRes.ok) {
        const errorText = await putRes.text();
        console.error("PUT error body:", errorText);
        throw new Error(`画像アップロード失敗 (status: ${putRes.status})`);
      }

      // 3. 公開URLをセット
      setImageUrl(data.publicUrl);
      setPreviewUrl(data.publicUrl);
    } catch (e) {
      setUploadError(e.message || "画像アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const isFormValid =
    title.trim() && price && category && subCategory && description.trim();

  return (
    <div
      style={{
        display: "flex",
        gap: "24px",
        padding: "24px",
        maxWidth: "1000px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Left image column */}
      <div
        style={{
          width: "40%",
          minWidth: "260px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{ marginBottom: "12px" }}>商品画像</h2>

        {previewUrl || imageUrl ? (
          <div
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              overflow: "hidden",
              borderRadius: "8px",
              border: "1px solid #eee",
              backgroundColor: "#f5f5f5",
              position: "relative",
            }}
          >
            <img
              src={previewUrl || imageUrl}
              alt="プレビュー"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl("");
                setImageUrl("");
              }}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "4px 8px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              削除
            </button>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: "8px",
              border: "1px dashed #ccc",
              backgroundColor: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#777",
              fontSize: "14px",
              textAlign: "center",
              padding: "8px",
            }}
          >
            画像は登録されていません
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setSelectedFile(file);
            setUploadError("");
            if (file) {
              setImageUrl("");
              setPreviewUrl(URL.createObjectURL(file));
            }
          }}
          style={{ marginTop: "12px" }}
        />

        <button
          type="button"
          onClick={handleImageUpload}
          disabled={!selectedFile || uploading}
          style={{
            marginTop: "8px",
            padding: "8px 16px",
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: !selectedFile || uploading ? "not-allowed" : "pointer",
            opacity: !selectedFile || uploading ? 0.7 : 1,
          }}
        >
          {!selectedFile
            ? "画像を選択してください"
            : uploading
            ? "アップロード中..."
            : "画像をアップロード"}
        </button>

        {uploadError && (
          <div style={{ color: "red", marginTop: "8px" }}>{uploadError}</div>
        )}
      </div>
      {/* Right form column */}
      <div style={{ flex: 1 }}>
        <h1 style={{ color: "red" }}>【本番確認用】商品を出品</h1>

        <section style={{ marginBottom: "20px" }}>
          <label>
            商品名
            <span style={{ color: "red", marginLeft: 4 }}>*</span>
          </label>
          <input
            type="text"
            placeholder="例：ナイキ エアフォース1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "6px" }}
          />
        </section>

        <section style={{ marginBottom: "20px" }}>
          <label>
            価格（円）
            <span style={{ color: "red", marginLeft: 4 }}>*</span>
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "6px" }}
          />
        </section>
        <section style={{ marginBottom: "20px" }}>
          <label>
            大カテゴリ
            <span style={{ color: "red", marginLeft: 4 }}>*</span>
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            {[
              { key: "fashion", label: "ファッション", color: "#e91e63" },
              { key: "electronics", label: "家電・電子機器", color: "#3f51b5" },
              { key: "book", label: "本", color: "#795548" },
              { key: "hobby", label: "ホビー", color: "#9c27b0" },
              { key: "sports", label: "スポーツ", color: "#2196f3" },
              { key: "beauty", label: "美容", color: "#ff9800" },
              { key: "lifestyle", label: "生活用品", color: "#009688" },
              { key: "handmade", label: "ハンドメイド", color: "#8bc34a" },
              { key: "kids", label: "キッズ", color: "#ff5722" },
              { key: "pet", label: "ペット", color: "#607d8b" },
              { key: "food", label: "食品", color: "#4caf50" },
              { key: "other", label: "その他", color: "#9e9e9e" },
            ].map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setCategory(c.key);
                  setSubCategory("");
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: "999px",
                  border:
                    category === c.key
                      ? `2px solid ${c.color}`
                      : "1px solid #ccc",
                  background: category === c.key ? c.color : "#fff",
                  color: category === c.key ? "#fff" : "#333",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: category === c.key ? "bold" : "normal",
                  transition: "all 0.15s ease",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {category && SUB_CATEGORIES[category] && (
          <section style={{ marginBottom: "20px" }}>
            <label>
              小カテゴリ
              <span style={{ color: "red", marginLeft: 4 }}>*</span>
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginTop: "8px",
              }}
            >
              {SUB_CATEGORIES[category].map((sc) => (
                <button
                  key={sc.key}
                  type="button"
                  onClick={() => setSubCategory(sc.key)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "999px",
                    border: `1px solid ${CATEGORY_COLORS[category]}`,
                    background:
                      subCategory === sc.key
                        ? CATEGORY_COLORS[category]
                        : `${CATEGORY_COLORS[category]}22`,
                    color:
                      subCategory === sc.key
                        ? "#fff"
                        : CATEGORY_COLORS[category],
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: subCategory === sc.key ? "bold" : "normal",
                    transition: "all 0.15s ease",
                  }}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </section>
        )}

        <section
          style={{
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginBottom: "20px",
            background: "#fafafa",
          }}
        >
          <h3 style={{ marginBottom: "8px" }}>🤖 AI説明文生成</h3>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "10px",
            }}
          >
            {promptPresets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrompt(p)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "12px",
                  border: "1px solid #ccc",
                  background: prompt === p ? "#6f42c1" : "#fff",
                  color: prompt === p ? "#fff" : "#333",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="生成条件を自由入力（例：メルカリ向け・丁寧）"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />

          <button
            onClick={handleGenerateDescription}
            disabled={generating || !title.trim()}
            style={{
              width: "100%",
              padding: "10px",
              background: "#6f42c1",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: generating ? "not-allowed" : "pointer",
              opacity: generating ? 0.7 : 1,
            }}
          >
            {generating ? "AIが生成中..." : "AIで説明文を自動生成"}
          </button>

          {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
        </section>

        <section style={{ marginBottom: "24px" }}>
          <label>
            商品説明
            <span style={{ color: "red", marginLeft: 4 }}>*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              minHeight: "140px",
              padding: "8px",
              marginTop: "6px",
            }}
          />
          <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            ※ AIが生成した文章は自由に編集できます
          </p>
        </section>

        {!isFormValid && (
          <p
            style={{ color: "#d32f2f", fontSize: "12px", marginBottom: "8px" }}
          >
            ※ 商品名・価格・大カテゴリ・小カテゴリ・商品説明は必須です
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          style={{
            width: "100%",
            padding: "14px",
            background: "#e60033",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: !isFormValid ? "not-allowed" : "pointer",
            opacity: !isFormValid ? 0.6 : 1,
          }}
        >
          出品する
        </button>
      </div>
    </div>
  );
};

export default CreateProduct;
