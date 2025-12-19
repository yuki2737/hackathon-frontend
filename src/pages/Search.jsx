import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const formatNumber = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  const num = value.toString().replace(/,/g, "");
  if (isNaN(num)) return "";
  return Number(num).toLocaleString("ja-JP");
};

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

const CATEGORY_COLORS = {
  fashion: { bg: "#fee2e2", active: "#ef4444", text: "#7f1d1d" },
  electronics: { bg: "#e0e7ff", active: "#6366f1", text: "#1e3a8a" },
  book: { bg: "#fef3c7", active: "#f59e0b", text: "#78350f" },
  hobby: { bg: "#f3e8ff", active: "#a855f7", text: "#581c87" },
  sports: { bg: "#dcfce7", active: "#22c55e", text: "#14532d" },
  beauty: { bg: "#ffe4e6", active: "#ec4899", text: "#831843" },
  lifestyle: { bg: "#ecfeff", active: "#06b6d4", text: "#164e63" },
  handmade: { bg: "#fff7ed", active: "#f97316", text: "#7c2d12" },
  kids: { bg: "#f0fdf4", active: "#10b981", text: "#064e3b" },
  pet: { bg: "#faf5ff", active: "#8b5cf6", text: "#4c1d95" },
  food: { bg: "#fef2f2", active: "#dc2626", text: "#7f1d1d" },
  other: { bg: "#f3f4f6", active: "#6b7280", text: "#1f2937" },
};

const SUBCATEGORY_LABELS = {
  tops: "トップス",
  bottoms: "ボトムス",
  shoes: "シューズ",
  fashion_other: "その他",
  smartphone: "スマートフォン",
  computer: "パソコン",
  audio: "オーディオ",
  electronics_other: "その他",
  novel: "小説",
  comic: "漫画",
  magazine: "雑誌",
  book_other: "その他",
  toy: "おもちゃ",
  model: "模型",
  collectible: "コレクション",
  hobby_other: "その他",
  equipment: "用品",
  clothing: "ウェア",
  accessory: "アクセサリー",
  sports_other: "その他",
  skincare: "スキンケア",
  makeup: "メイク",
  fragrance: "香水",
  beauty_other: "その他",
  kitchen: "キッチン",
  furniture: "家具",
  decor: "インテリア",
  lifestyle_other: "その他",
  jewelry: "アクセサリー",
  craft: "クラフト",
  handmade_other: "その他",
  baby_goods: "ベビー用品",
  kids_other: "その他",
  food: "フード",
  toys: "おもちゃ",
  pet_other: "その他",
  snack: "お菓子",
  beverage: "飲料",
  ingredient: "食材",
  food_other: "その他",
  misc: "その他",
};

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
    sort: params.get("sort") || "",
  });

  // 入力中の値
  const [input, setInput] = useState({ ...searchParams });

  const [results, setResults] = useState([]);

  useEffect(() => {
    // 初回表示時に全商品を取得
    fetch(`${API_BASE}/products`)
      .then((res) => res.json())
      .then((data) => setResults(data.products || []))
      .catch(console.error);
  }, []);

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
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
          background: "#fafafa",
          marginBottom: 24,
        }}
      >
        <h2>商品検索</h2>

        <input
          placeholder="キーワード"
          value={input.keyword}
          onChange={(e) => setInput({ ...input, keyword: e.target.value })}
          style={{ marginBottom: 8 }}
        />

        <hr
          style={{
            border: "none",
            borderTop: "1px solid #e5e7eb",
            margin: "16px 0",
          }}
        />

        {/* 並び替え */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ marginRight: 8, fontWeight: "bold" }}>並び替え</label>
          <select
            value={input.sort}
            onChange={(e) =>
              setInput({
                ...input,
                sort: e.target.value,
              })
            }
            style={{
              fontSize: 13,
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              background: "#fff",
            }}
          >
            <option value="">指定なし</option>
            <option value="price_asc">価格が安い順</option>
            <option value="price_desc">価格が高い順</option>
          </select>
        </div>

        <div style={{ marginTop: 12, marginBottom: 8 }}>
          <div style={{ marginBottom: 8, fontWeight: "bold" }}>カテゴリ</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORY_OPTIONS.filter((c) => c.value).map((c) => {
              const selected = input.category === c.value;
              const colors = CATEGORY_COLORS[c.value];
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
                    padding: "8px 14px",
                    borderRadius: 999,
                    border: "none",
                    background: selected ? colors.active : "#f3f4f6",
                    color: selected ? "#fff" : "#374151",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: "bold",
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {input.category && (
          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <div style={{ marginBottom: 8, fontWeight: "bold" }}>
              サブカテゴリ
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(SUBCATEGORY_OPTIONS[input.category] || []).map((s) => {
                const selected = input.subCategory.includes(s);
                const baseColor = CATEGORY_COLORS[input.category];
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
                      padding: "7px 12px",
                      borderRadius: 999,
                      border: "none",
                      background: selected ? baseColor.active : baseColor.bg,
                      color: selected ? "#fff" : baseColor.text,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    {SUBCATEGORY_LABELS[s] || s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <hr
          style={{
            border: "none",
            borderTop: "1px solid #e5e7eb",
            margin: "16px 0",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 4,
          }}
        >
          <div style={{ position: "relative", width: 100 }}>
            <input
              type="text"
              placeholder="最小価格"
              value={formatNumber(input.minPrice)}
              onChange={(e) =>
                setInput({
                  ...input,
                  minPrice: e.target.value.replace(/,/g, ""),
                })
              }
              style={{
                width: "100%",
                height: 32,
                padding: "4px 22px 4px 8px",
                fontSize: 12,
                boxSizing: "border-box",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: 6,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 11,
                color: "#6b7280",
                pointerEvents: "none",
              }}
            >
              円
            </span>
          </div>

          <span
            style={{
              margin: "0 2px",
              fontSize: 13,
              color: "#6b7280",
              lineHeight: "32px",
              userSelect: "none",
            }}
          >
            〜
          </span>

          <div style={{ position: "relative", width: 100 }}>
            <input
              type="text"
              placeholder="最大価格"
              value={formatNumber(input.maxPrice)}
              onChange={(e) =>
                setInput({
                  ...input,
                  maxPrice: e.target.value.replace(/,/g, ""),
                })
              }
              style={{
                width: "100%",
                height: 32,
                padding: "4px 22px 4px 8px",
                fontSize: 12,
                boxSizing: "border-box",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: 6,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 11,
                color: "#6b7280",
                pointerEvents: "none",
              }}
            >
              円
            </span>
          </div>
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid #e5e7eb",
            margin: "16px 0",
          }}
        />

        <button
          onClick={onSearch}
          style={{
            marginTop: 20,
            padding: "10px 24px",
            borderRadius: 999,
            background: "#111827",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          検索
        </button>
      </div>

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
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
            }}
          >
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.title}
                style={{
                  width: "100%",
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 6,
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 160,
                  borderRadius: 6,
                  background: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: "#666",
                  textAlign: "center",
                  padding: 8,
                  boxSizing: "border-box",
                }}
              >
                画像は登録されていません
              </div>
            )}
            <div style={{ marginTop: 8, fontWeight: "bold" }}>{p.title}</div>
            <div style={{ color: "#e60033", fontWeight: "bold" }}>
              {Number(p.price).toLocaleString("ja-JP")}円
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
