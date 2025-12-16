import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const CATEGORY_OPTIONS = [
  { value: "", label: "（指定なし）" },
  { value: "fashion", label: "ファッション" },
  { value: "electronics", label: "家電・スマホ" },
  { value: "book", label: "本" },
  { value: "hobby", label: "ホビー" },
  { value: "sports", label: "スポーツ" },
  { value: "beauty", label: "美容" },
  { value: "lifestyle", label: "生活" },
  { value: "handmade", label: "ハンドメイド" },
  { value: "kids", label: "キッズ" },
  { value: "pet", label: "ペット" },
  { value: "food", label: "食品" },
  { value: "other", label: "その他" },
];

const SUBCATEGORY_OPTIONS = {
  fashion: ["tops", "bottoms", "shoes", "fashion_other"],
  electronics: ["smartphone", "computer", "audio", "electronics_other"],
  book: ["novel", "comic", "magazine", "book_other"],
  hobby: ["toy", "model", "collectible", "hobby_other"],
  sports: ["equipment", "clothing", "accessory", "sports_other"],
  beauty: ["skincare", "makeup", "fragrance", "beauty_other"],
  lifestyle: ["kitchen", "furniture", "decor", "lifestyle_other"],
  handmade: ["jewelry", "clothing", "craft", "handmade_other"],
  kids: ["clothing", "toy", "baby_goods", "kids_other"],
  pet: ["food", "accessory", "toys", "pet_other"],
  food: ["snack", "beverage", "ingredient", "food_other"],
  other: ["misc"],
};

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  // 検索条件（確定値）
  const [searchParams, setSearchParams] = useState({
    keyword: params.get("keyword") || "",
    category: params.get("category") || "",
    subCategory: params.getAll("subCategory") || [],
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
  });

  // 入力中の値
  const [input, setInput] = useState({ ...searchParams });

  const [results, setResults] = useState([]);

  const onSearch = () => {
    const qs = new URLSearchParams();
    Object.entries(input).forEach(([k, v]) => {
      if (!v || (Array.isArray(v) && v.length === 0)) return;

      if (Array.isArray(v)) {
        v.forEach((item) => qs.append(k, item));
      } else {
        qs.set(k, v);
      }
    });

    setSearchParams({ ...input });
    navigate(`/search?${qs.toString()}`);

    fetch(`${API_BASE}/products?${qs.toString()}`)
      .then((res) => res.json())
      .then((data) => setResults(data.products || []))
      .catch(console.error);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>商品検索</h2>

      <input
        placeholder="キーワード"
        value={input.keyword}
        onChange={(e) => setInput({ ...input, keyword: e.target.value })}
      />

      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 8, fontWeight: "bold" }}>カテゴリ</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CATEGORY_OPTIONS.filter((c) => c.value).map((c) => {
            const selected = input.category === c.value;
            return (
              <button
                key={c.value}
                onClick={() =>
                  setInput({
                    ...input,
                    category: selected ? "" : c.value,
                    subCategory: [], // カテゴリ切替時はサブカテゴリ解除
                  })
                }
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: selected ? "none" : "1px solid #ccc",
                  background: selected ? "#333" : "#fff",
                  color: selected ? "#fff" : "#333",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {input.category && (
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8, fontWeight: "bold" }}>
            サブカテゴリ
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(SUBCATEGORY_OPTIONS[input.category] || []).map((s) => {
              const selected = input.subCategory.includes(s);
              return (
                <button
                  key={s}
                  onClick={() =>
                    setInput({
                      ...input,
                      subCategory: selected
                        ? input.subCategory.filter((v) => v !== s)
                        : [...input.subCategory, s],
                    })
                  }
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: selected ? "none" : "1px solid #ccc",
                    background: selected ? "#555" : "#fff",
                    color: selected ? "#fff" : "#333",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <input
        type="number"
        placeholder="最小価格"
        value={input.minPrice}
        onChange={(e) => setInput({ ...input, minPrice: e.target.value })}
      />

      <input
        type="number"
        placeholder="最大価格"
        value={input.maxPrice}
        onChange={(e) => setInput({ ...input, maxPrice: e.target.value })}
      />

      <button
        onClick={onSearch}
        style={{
          marginTop: 10,
          padding: "8px 16px",
          borderRadius: 6,
          background: "#333",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        絞り込む
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        {results.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/products/${p.id}`)}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 10,
              cursor: "pointer",
            }}
          >
            <img
              src={p.imageUrl || "https://placehold.jp/300x300.png"}
              alt={p.title}
              style={{
                width: "100%",
                height: 160,
                objectFit: "cover",
                borderRadius: 6,
              }}
            />
            <div style={{ marginTop: 8, fontWeight: "bold" }}>{p.title}</div>
            <div style={{ color: "#e60033", fontWeight: "bold" }}>
              {p.price}円
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
