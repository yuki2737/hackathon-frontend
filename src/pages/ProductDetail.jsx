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
      .then((data) => setProduct(data.product))
      .catch((err) => console.error(err));
  }, [id]);

  if (loading || !product) return <p>読み込み中...</p>;

  // 判定: この商品が自分のものか
  const isMyProduct =
    firebaseUser && product?.user?.uid && firebaseUser.uid === product.user.uid;

  return (
    <div
      style={{
        display: "block",
        height: "calc(100vh - 120px)",
        position: "relative",
      }}
    >
      {/* 左固定エリア */}
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
          style={{ marginBottom: "15px", alignSelf: "flex-start" }}
        >
          ← 戻る
        </button>

        <h1 style={{ textAlign: "center", fontSize: "18px" }}>
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
                backgroundColor: "#f5f5f5",
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
      </div>

      {/* 右スクロールエリア */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: "110px",
          width: "50%",
          height: "calc(100vh - 180px)",
          overflowY: "auto",
          padding: "0 12px 120px",
          boxSizing: "border-box",
        }}
      >
        <p style={{ marginTop: "4px", fontSize: "13px", color: "#777" }}>
          {CATEGORY_LABELS[product.category] || product.category}
          {product.subCategory && (
            <>
              {" / "}
              {SUB_CATEGORY_LABELS[product.subCategory] || product.subCategory}
            </>
          )}
        </p>

        <h2 style={{ marginTop: "10px", color: "#e60033", fontSize: "18px" }}>
          {product.price}円
        </h2>

        <p
          style={{
            marginTop: "10px",
            whiteSpace: "pre-line",
            fontSize: "13px",
            lineHeight: "1.5",
          }}
        >
          {product.description}
        </p>
      </div>

      {/* 出品者に質問する（DM）ボタン */}
      {(() => {
        const isMyProduct =
          firebaseUser &&
          product?.user?.uid &&
          firebaseUser.uid === product.user.uid;
        if (!isMyProduct) {
          return (
            <button
              onClick={handleCreateThread}
              disabled={!firebaseUser}
              style={{
                position: "fixed",
                left: 0,
                bottom: "64px",
                width: "100%",
                backgroundColor: "#333",
                color: "white",
                border: "none",
                padding: "14px 0",
                fontSize: "15px",
                cursor: "pointer",
                zIndex: 1999,
              }}
            >
              出品者に質問する
            </button>
          );
        } else {
          return (
            <button
              disabled={true}
              style={{
                position: "fixed",
                left: 0,
                bottom: "64px",
                width: "100%",
                backgroundColor: "#aaa",
                color: "white",
                border: "none",
                padding: "14px 0",
                fontSize: "15px",
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
          isMyProduct || product.status === "sold_out" ? null : handlePurchase
        }
        disabled={isMyProduct || product.status === "sold_out"}
        style={{
          position: "fixed",
          left: 0,
          bottom: 0,
          width: "100%",
          backgroundColor:
            isMyProduct || product.status === "sold_out" ? "#aaa" : "#e60033",
          color: "white",
          border: "none",
          padding: "16px 0",
          fontSize: "18px",
          cursor:
            isMyProduct || product.status === "sold_out"
              ? "not-allowed"
              : "pointer",
          opacity: isMyProduct || product.status === "sold_out" ? 0.6 : 1,
          zIndex: 2000,
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
