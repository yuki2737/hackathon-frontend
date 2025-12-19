import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const formatDate = (d) => {
  const date = new Date(d);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
};

const Threads = () => {
  const navigate = useNavigate();
  const { firebaseUser, loading } = useAuth();
  const [threads, setThreads] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      navigate("/login");
      return;
    }

    const fetchThreads = async () => {
      setFetching(true);
      try {
        const res = await fetch(`${API_BASE}/threads?uid=${firebaseUser.uid}`, {
          headers: {
            Authorization: `Bearer ${await firebaseUser.getIdToken()}`,
          },
        });
        const data = await res.json();
        console.log("threads api response", data);
        if (!res.ok) throw new Error(data.error || "取得失敗");
        setThreads((data?.threads ?? data) || []);
        setFetching(false);
      } catch (e) {
        setError(e.message);
        setFetching(false);
      }
    };

    fetchThreads();
  }, [firebaseUser, loading, navigate]);

  if (loading) return null;

  return (
    <div
      style={{
        padding: "12px",
        paddingTop: "72px",
        maxWidth: "720px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: "56px",
          background: "#fff",
          zIndex: 1,
          paddingBottom: "8px",
          marginBottom: "8px",
          borderBottom: "1px solid #eee",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px" }}>💬 メッセージ</h2>
      </div>

      {fetching && (
        <div style={{ textAlign: "center", color: "#777", padding: "40px 0" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>💬</div>
          <div>メッセージを読み込んでいます…</div>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!fetching && threads.length === 0 && (
        <div style={{ textAlign: "center", color: "#777", padding: "40px 0" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>💬</div>
          <div>まだメッセージはありません</div>
        </div>
      )}

      {Array.isArray(threads) &&
        threads.map((t) => (
          <div
            key={t.id}
            onClick={() => navigate(`/threads/${t.id}`)}
            style={{
              display: "flex",
              gap: "12px",
              padding: "12px",
              borderBottom: "1px solid #eee",
              cursor: "pointer",
              background: "#fff",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            {/* 商品カード（画像＋商品名） */}
            <div
              style={{
                width: "84px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "#f5f5f5",
                }}
              >
                {t.productImageUrl || t.product?.imageUrl ? (
                  <img
                    src={t.productImageUrl || t.product?.imageUrl}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      fontSize: "12px",
                      color: "#999",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    No Image
                  </div>
                )}
              </div>
            </div>

            {/* テキスト */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              >
                {t.productTitle || t.product?.title || "商品"}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#555",
                  marginBottom: "6px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t.lastMessage
                  ? t.lastMessage.length > 40
                    ? t.lastMessage.slice(0, 40) + "…"
                    : t.lastMessage
                  : "まだメッセージはありません"}
              </div>

              <div style={{ fontSize: "11px", color: "#999" }}>
                {formatDate(t.updatedAt)}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Threads;
