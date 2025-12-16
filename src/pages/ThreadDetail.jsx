// src/pages/ThreadDetail.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const ThreadDetail = () => {
  const navigate = useNavigate();
  const { threadId } = useParams();
  const { firebaseUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const listEndRef = useRef(null);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  const numericThreadId = Number(threadId);
  const isInvalidThreadId = !threadId || Number.isNaN(numericThreadId);

  const fetchThreadDetail = async () => {
    if (!API_BASE) return;
    try {
      const res = await fetch(`${API_BASE}/threads/${numericThreadId}`);
      const data = await res.json();
      if (res.ok) {
        const p = data?.thread?.product || data?.product || null;
        if (p) {
          setProduct({
            id: p.id,
            title: p.title || "",
            price: p.price,
            imageUrl: p.imageUrl || p.image_url || "",
          });
        } else {
          setProduct(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(numericThreadId)) {
      fetchMessages();
      fetchThreadDetail();
    }
  }, [numericThreadId]);

  useEffect(() => {
    // ログイン情報が入り次第、表示を整える
    setTimeout(scrollToBottom, 0);
  }, [firebaseUser]);

  if (isInvalidThreadId) {
    return (
      <div
        style={{
          height: "calc(100vh - 120px)",
          display: "flex",
          flexDirection: "column",
          padding: "12px",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <button onClick={() => navigate("/threads")}>
            ← スレッド一覧へ戻る
          </button>
          <h2 style={{ margin: 0, fontSize: "18px" }}>エラー</h2>
        </div>
        <div
          style={{
            padding: "8px 10px",
            background: "#fff0f3",
            border: "1px solid #ffd6de",
            borderRadius: "8px",
            color: "#b00020",
            fontSize: "13px",
          }}
        >
          不正なスレッドIDです
        </div>
      </div>
    );
  }

  const scrollToBottom = () => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!API_BASE) {
      setError("API の接続先が設定されていません");
      return;
    }

    try {
      setError("");
      const res = await fetch(
        `${API_BASE}/threads/${numericThreadId}/messages`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "メッセージの取得に失敗しました");
        return;
      }
      setMessages(data.messages || []);
      // 次の描画後に最下部へ
      setTimeout(scrollToBottom, 0);
    } catch (e) {
      console.error(e);
      setError("メッセージの取得中にエラーが発生しました");
    }
  };

  const sendMessage = async () => {
    if (!firebaseUser) {
      alert("送信するにはログインが必要です");
      return;
    }
    if (!content.trim()) return;
    if (!API_BASE) {
      alert("API の接続先が設定されていません");
      return;
    }

    try {
      setError("");
      const res = await fetch(
        `${API_BASE}/threads/${numericThreadId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderUid: firebaseUser.uid,
            content,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "送信に失敗しました");
        return;
      }

      setContent("");
      await fetchMessages();
      setTimeout(scrollToBottom, 0);
    } catch (e) {
      console.error(e);
      setError("送信中にエラーが発生しました");
    }
  };

  return (
    <div
      style={{
        height: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
        padding: "12px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* 上部バー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <button onClick={() => navigate(-1)}>← 戻る</button>
        <h2 style={{ margin: 0, fontSize: "18px" }}>メッセージ</h2>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "10px",
            padding: "8px 10px",
            background: "#fff0f3",
            border: "1px solid #ffd6de",
            borderRadius: "8px",
            color: "#b00020",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {product && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "#ffffff",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              cursor: "pointer",
            }}
            onClick={() => navigate(`/products/${product.id}`)}
          >
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                style={{
                  width: "72px",
                  height: "72px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "10px",
                  background: "#ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              >
                No Image
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  marginBottom: "6px",
                }}
              >
                {product.title}
              </div>
              <div style={{ fontSize: "14px", color: "#555" }}>
                ¥{product.price}
              </div>
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                  color: "#888",
                }}
              >
                タップして商品詳細を見る
              </div>
            </div>
          </div>
        </div>
      )}
      {/* メッセージ一覧 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "6px 2px",
          paddingBottom: "12px",
          borderRadius: "8px",
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: "#777", fontSize: "13px" }}>
            まだメッセージはありません
          </p>
        ) : (
          messages.map((m) => {
            console.log("message debug", {
              content: m.content,
              senderUid: m.senderUid,
              senderId: m.senderId,
              sender: m.sender,
              firebaseUid: firebaseUser?.uid,
            });
            const isMine =
              firebaseUser &&
              // Firebase UID ベース（最優先）
              (m.senderUid === firebaseUser.uid ||
                m.sender?.uid === firebaseUser.uid);
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    background: isMine ? "#e60033" : "#eee",
                    color: isMine ? "#fff" : "#000",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    maxWidth: "75%",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontSize: "14px",
                    lineHeight: 1.4,
                    marginLeft: isMine ? "auto" : "0",
                    marginRight: isMine ? "0" : "auto",
                    textAlign: isMine ? "right" : "left",
                  }}
                >
                  {m.content}
                </span>
              </div>
            );
          })
        )}
        <div ref={listEndRef} />
      </div>

      {/* 入力欄（下部固定風） */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          paddingTop: "10px",
          borderTop: "1px solid #eee",
          background: "white",
        }}
      >
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            outline: "none",
          }}
          placeholder={
            firebaseUser ? "メッセージを入力" : "ログインすると送信できます"
          }
          disabled={!firebaseUser}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!firebaseUser || !content.trim()}
          style={{
            padding: "0 14px",
            borderRadius: "10px",
            border: "none",
            background: !firebaseUser || !content.trim() ? "#aaa" : "#e60033",
            color: "white",
            cursor:
              !firebaseUser || !content.trim() ? "not-allowed" : "pointer",
          }}
        >
          送信
        </button>
      </div>
    </div>
  );
};

export default ThreadDetail;
