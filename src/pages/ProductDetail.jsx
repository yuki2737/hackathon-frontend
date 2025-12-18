import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import {
  CATEGORY_LABELS,
  SUB_CATEGORY_LABELS,
} from "../constants/categoryLabels";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { firebaseUser, appUser, loading } = useAuth();

  const [aiDecision, setAiDecision] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handlePurchase = async () => {
    if (loading) return;

    if (!firebaseUser) {
      alert("購入にはログインが必要です");
      navigate("/login");
      return;
    }

    if (!appUser) {
      alert("ユーザー情報を取得中です。少し待ってから再度お試しください");
      return;
    }

    if (!API_BASE) {
      alert("API の接続先が設定されていません");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(id),
          buyerUid: firebaseUser.uid,
        }),
      });

      const data = await res.json();

      console.log("order response status:", res.status);
      console.log("order response body:", data);

      if (!res.ok) {
        alert(data.error || "購入に失敗しました");
        return;
      }

      navigate("/purchase-complete");
    } catch (err) {
      console.error(err);
      alert("購入処理中にエラーが発生しました");
    }
  };

  const handleCreateThread = async () => {
    if (!firebaseUser) {
      alert("ログインすると出品者に質問できます");
      navigate("/login");
      return;
    }
    if (!product?.user?.uid) {
      alert("出品者情報を取得できませんでした");
      return;
    }
    if (!API_BASE) {
      alert("API の接続先が設定されていません");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(id),
          buyerUid: firebaseUser.uid,
          sellerUid: product.user.uid,
          type: "inquiry",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "スレッド作成に失敗しました");
        return;
      }
      navigate(`/threads/${data.thread.id}`);
    } catch (err) {
      console.error(err);
      alert("スレッド作成中にエラーが発生しました");
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product);
        if (API_BASE && data.product) {
          setAiLoading(true);
          fetch(`${API_BASE}/ai/purchase-decision-support`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: data.product.title,
              category: data.product.category,
              price: data.product.price,
              description: data.product.description,
            }),
          })
            .then((res) => res.json())
            .then((aiData) => {
              // APIのsuccessラップを考慮して正規化
              const result =
                aiData.decision || aiData.result || aiData.evaluation || {};
              if (!result) {
                setAiDecision(null);
                setAiLoading(false);
                return;
              }

              setAiDecision({
                goodPoints: Array.isArray(result.goodPoints)
                  ? result.goodPoints
                  : [],
                decisionPoints: Array.isArray(result.decisionPoints)
                  ? result.decisionPoints
                  : [],
                ambiguousPoints: Array.isArray(result.ambiguousPoints)
                  ? result.ambiguousPoints
                  : [],
              });
              setAiLoading(false);
            })
            .catch((err) => {
              console.error(err);
              setAiLoading(false);
            });
        }
      })
      .catch((err) => console.error(err));
  }, [id, API_BASE]);

  if (loading || !product) return <p>読み込み中...</p>;

  // 判定: この商品が自分のものか
  const isMyProduct =
    firebaseUser && product?.user?.uid && firebaseUser.uid === product.user.uid;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
      }}
    >
      {/* 左固定エリア */}
      <div
        style={{
          width: "48%",
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
          backgroundColor: "#ffffff",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ marginBottom: "15px", alignSelf: "flex-start" }}
        >
          ← 戻る
        </button>

        <h1
          style={{ textAlign: "center", fontSize: "20px", fontWeight: "bold" }}
        >
          {product.title}
        </h1>

        <div style={{ width: "70%", position: "relative", marginTop: "6px" }}>
          {product.status === "sold_out" && (
            <div
              style={{
                position: "absolute",
                top: "8px",
                left: "8px",
                backgroundColor: "rgba(230,0,51,0.9)",
                color: "white",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "bold",
                zIndex: 10,
              }}
            >
              売り切れ
            </div>
          )}
          {product.imageUrl ? (
            <div
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                overflow: "hidden",
                borderRadius: "8px",
                border: "1px solid #eee",
                backgroundColor: "#f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={product.imageUrl}
                alt={product.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                overflow: "hidden",
                borderRadius: "8px",
                border: "1px dashed #ccc",
                backgroundColor: "#f0f2f5",
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
      </div>

      {/* 右スクロールエリア */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: "110px",
          width: "52%",
          height: "calc(100vh - 110px)",
          minHeight: "calc(100vh - 110px)",
          overflowY: "auto",
          padding: "0 12px 120px",
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            marginTop: "12px",
            marginBottom: "8px",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "4px 10px",
              fontSize: "12px",
              borderRadius: "999px",
              backgroundColor: "#e3f2fd",
              color: "#1565c0",
              fontWeight: "bold",
            }}
          >
            {CATEGORY_LABELS[product.category] || product.category}
          </span>

          {product.subCategory && (
            <span
              style={{
                padding: "4px 10px",
                fontSize: "12px",
                borderRadius: "999px",
                backgroundColor: "#f1f8e9",
                color: "#2e7d32",
                fontWeight: "bold",
              }}
            >
              {SUB_CATEGORY_LABELS[product.subCategory] || product.subCategory}
            </span>
          )}
        </div>

        <h2
          style={{
            marginTop: "10px",
            color: "#d32f2f",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          {product.price}円
        </h2>

        <section
          style={{
            marginTop: "14px",
            border: "1px solid #e6e8eb",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            padding: "14px 16px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "999px",
                backgroundColor: "#d32f2f",
                display: "inline-block",
              }}
            />
            商品説明
          </div>
          <p
            style={{
              margin: 0,
              whiteSpace: "pre-line",
              fontSize: "14px",
              lineHeight: "1.7",
              color: "#222",
            }}
          >
            {product.description}
          </p>
        </section>

        {aiLoading && (
          <p style={{ fontSize: "13px", color: "#777", marginTop: "12px" }}>
            🤖 AIが購入判断を分析中です…
          </p>
        )}

        {aiDecision && (
          <section
            style={{
              border: "1px solid #e6e8eb",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              padding: "16px 18px",
              marginTop: "16px",
              fontSize: "14px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "12px",
                fontSize: "15px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              🤖 AIによる購入判断サポート
            </h3>

            <p
              style={{ fontWeight: "bold", color: "#2e7d32", marginTop: "4px" }}
            >
              この商品の良い点
            </p>
            <ul
              style={{
                paddingLeft: "18px",
                marginTop: "6px",
                marginBottom: "8px",
              }}
            >
              {aiDecision.goodPoints.length > 0 ? (
                aiDecision.goodPoints.map((p, i) => (
                  <li key={`good-${i}`}>{p}</li>
                ))
              ) : (
                <li>特に気になるマイナス要素は見当たりません</li>
              )}
            </ul>

            {Array.isArray(aiDecision.decisionPoints) &&
              aiDecision.decisionPoints.length > 0 && (
                <>
                  <p
                    style={{
                      fontWeight: "bold",
                      color: "#1565c0",
                      marginTop: "10px",
                    }}
                  >
                    購入前に確認したい点
                  </p>
                  <ul
                    style={{
                      paddingLeft: "18px",
                      marginTop: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    {aiDecision.decisionPoints.map((p, i) => (
                      <li key={`decision-${i}`}>{p}</li>
                    ))}
                  </ul>
                </>
              )}

            {Array.isArray(aiDecision.ambiguousPoints) &&
              aiDecision.ambiguousPoints.length > 0 && (
                <>
                  <p
                    style={{
                      fontWeight: "bold",
                      color: "#ef6c00",
                      marginTop: "10px",
                    }}
                  >
                    表現があいまいな点
                  </p>
                  <ul
                    style={{
                      paddingLeft: "18px",
                      marginTop: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    {aiDecision.ambiguousPoints.map((p, i) => (
                      <li key={`ambiguous-${i}`}>{p}</li>
                    ))}
                  </ul>
                </>
              )}

            <p
              style={{
                fontSize: "12px",
                color: "#888",
                marginTop: "12px",
                lineHeight: "1.4",
              }}
            >
              ※AIが商品情報をもとに購入判断の材料を整理しています
            </p>
          </section>
        )}
      </div>

      {/* 出品者に質問する（DM）ボタン */}
      {(() => {
        const isMyProduct =
          firebaseUser &&
          product?.user?.uid &&
          firebaseUser.uid === product.user.uid;
        if (!isMyProduct) {
          const isSoldOut = product.status === "sold_out";
          const disabled = !firebaseUser || isSoldOut;
          return (
            <button
              onClick={disabled ? null : handleCreateThread}
              disabled={disabled}
              style={{
                position: "fixed",
                width: "50%",
                left: "50%",
                bottom: "64px",
                padding: "14px 0",
                fontSize: "15px",
                transform: "translateX(-50%)",
                backgroundColor: disabled ? "#b0b0b0" : "#1976d2",
                color: "white",
                border: "none",
                cursor: disabled ? "not-allowed" : "pointer",
                zIndex: 1999,
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
                opacity: disabled ? 0.75 : 1,
              }}
            >
              {!firebaseUser
                ? "ログインすると出品者に質問できます"
                : isSoldOut
                ? "売り切れのため質問できません"
                : "出品者に質問する"}
            </button>
          );
        } else {
          return (
            <button
              disabled={true}
              style={{
                position: "fixed",
                width: "50%",
                left: "50%",
                bottom: "64px",
                padding: "14px 0",
                fontSize: "15px",
                transform: "translateX(-50%)",
                backgroundColor: "#b0b0b0",
                color: "white",
                border: "none",
                cursor: "not-allowed",
                zIndex: 1999,
              }}
            >
              自分の商品には質問できません
            </button>
          );
        }
      })()}
      {/* 画面下の購入ボタン（全幅固定） */}
      <button
        onClick={
          isMyProduct || product.status === "sold_out"
            ? null
            : () => {
                const ok = window.confirm("この商品を購入しますか？");
                if (ok) handlePurchase();
              }
        }
        disabled={isMyProduct || product.status === "sold_out"}
        style={{
          position: "fixed",
          width: "50%",
          left: "50%",
          bottom: 0,
          padding: "16px 0",
          fontSize: "18px",
          transform: "translateX(-50%)",
          backgroundColor:
            isMyProduct || product.status === "sold_out" ? "#aaa" : "#d32f2f",
          color: "white",
          border: "none",
          cursor:
            isMyProduct || product.status === "sold_out"
              ? "not-allowed"
              : "pointer",
          opacity: isMyProduct || product.status === "sold_out" ? 0.6 : 1,
          zIndex: 2000,
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      >
        {isMyProduct
          ? "自分の商品は購入できません"
          : product.status === "sold_out"
          ? "売り切れ"
          : "購入する"}
      </button>
    </div>
  );
};

export default ProductDetail;
