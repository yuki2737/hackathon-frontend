// src/pages/ThreadDetail.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { CATEGORY_LABELS } from "../constants/categoryLabels";

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
  const [aiQuestions, setAiQuestions] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiAnswers, setAiAnswers] = useState([]);
  const [loadingAiAnswer, setLoadingAiAnswer] = useState(false);
  const [sellerUid, setSellerUid] = useState(null);

  const numericThreadId = Number(threadId);
  const isInvalidThreadId = !threadId || Number.isNaN(numericThreadId);

  const fetchThreadDetail = async () => {
    if (!API_BASE) return;
    try {
      const res = await fetch(`${API_BASE}/threads/${numericThreadId}`);
      const data = await res.json();
      if (res.ok) {
        const product = data?.thread?.product;
        if (!product) return;

        setProduct({
          id: product.id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl || "",
          category: product.category || "",
        });

        // ★ 出品者UIDは「商品を出品したユーザー」からのみ取得
        setSellerUid(product.user?.uid ?? null);
        console.log("thread detail debug", {
          threadId: numericThreadId,
          sellerUid: product.user?.uid ?? null,
          firebaseUid: firebaseUser?.uid,
        });
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
  }, [numericThreadId, firebaseUser?.uid]);

  useEffect(() => {
    if (product) {
      fetchAiQuestions();
    }
  }, [product]);

  useEffect(() => {
    // ログイン情報が入り次第、表示を整える
    setTimeout(scrollToBottom, 0);
  }, [firebaseUser]);

  // 【A】isSeller の定義を変更
  const isSeller =
    Boolean(firebaseUser?.uid) &&
    Boolean(sellerUid) &&
    firebaseUser.uid === sellerUid;

  // (early return for isInvalidThreadId removed)

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
      // ★ isSeller判定＋fetchAiAnswers呼び出しを削除
    } catch (e) {
      console.error(e);
      setError("メッセージの取得中にエラーが発生しました");
    }
  };

  const fetchAiQuestions = async () => {
    if (!API_BASE || !product) return;

    try {
      setLoadingAi(true);
      const res = await fetch(`${API_BASE}/ai/dm-question-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: product.title,
          category: "",
          price: product.price,
          description: "",
        }),
      });

      const data = await res.json();
      if (res.ok && data?.questions) {
        setAiQuestions(data.questions);
        console.log("AI questions received:", data.questions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  // 【B】fetchAiAnswers を return より前・条件なしで定義
  const fetchAiAnswers = useCallback(
    async (questionText) => {
      if (!API_BASE || !product || !questionText) return;

      try {
        setLoadingAiAnswer(true);
        const res = await fetch(`${API_BASE}/ai/dm-answer-suggestions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: questionText,
            title: product.title,
            category: "",
            price: product.price,
            description: "",
          }),
        });

        const data = await res.json();
        if (res.ok && data?.answers) {
          setAiAnswers(data.answers);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAiAnswer(false);
      }
    },
    [API_BASE, product]
  );

  // 【C】出品者向けAI回答生成の useEffect を「uid確定後」に限定
  useEffect(() => {
    if (!firebaseUser?.uid) return;
    if (!sellerUid) return;
    if (!isSeller) return;
    if (!messages || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content) return;

    fetchAiAnswers(lastMessage.content);
  }, [firebaseUser?.uid, sellerUid, isSeller, messages, fetchAiAnswers]);

  const sendMessage = async () => {
    if (sending) return;
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
      setSending(true);
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
      setAiAnswers([]);
      await fetchMessages();
      if (product) {
        fetchAiQuestions();
      }
      setTimeout(scrollToBottom, 0);
    } catch (e) {
      console.error(e);
      setError("送信中にエラーが発生しました");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        height: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
        padding: "12px",
        paddingBottom: "0",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isInvalidThreadId && (
        <div
          style={{
            padding: "8px 10px",
            background: "#fff0f3",
            border: "1px solid #ffd6de",
            borderRadius: "8px",
            color: "#b00020",
            fontSize: "13px",
            marginBottom: "12px",
          }}
        >
          不正なスレッドIDです
        </div>
      )}
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
                  display: "flex",
                  gap: "6px",
                  marginBottom: "6px",
                  flexWrap: "wrap",
                }}
              >
                {product.category && (
                  <span
                    style={{
                      padding: "2px 8px",
                      fontSize: "11px",
                      borderRadius: "999px",
                      background: "#eef2ff",
                      color: "#4338ca",
                      border: "1px solid #dbeafe",
                    }}
                  >
                    {CATEGORY_LABELS[product.category] || product.category}
                  </span>
                )}
              </div>
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
      {!isSeller && aiQuestions.length > 0 && (
        <div
          style={{
            marginBottom: "10px",
            padding: "10px",
            background: "#f7f7ff",
            border: "1px solid #dcdcff",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              marginBottom: "6px",
              color: "#444",
            }}
          >
            🤖 AIが提案する質問
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {aiQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setContent(q)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ececff";
                  e.currentTarget.style.borderColor = "#9999ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.borderColor = "#ccc";
                }}
                style={{
                  fontSize: "13px",
                  padding: "6px 10px",
                  borderRadius: "16px",
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {q}
              </button>
            ))}
          </div>
          <div style={{ marginTop: "8px", textAlign: "right" }}>
            <button
              onClick={fetchAiQuestions}
              disabled={loadingAi}
              style={{
                fontSize: "12px",
                padding: "4px 8px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                background: loadingAi ? "#f0f0f0" : "#fff",
                color: "#555",
                cursor: loadingAi ? "not-allowed" : "pointer",
              }}
            >
              {loadingAi ? "生成中…" : "別の質問を生成する"}
            </button>
          </div>
        </div>
      )}
      {isSeller && (
        <div
          style={{
            marginBottom: "10px",
            padding: "10px",
            background: "#f0fff7",
            border: "1px solid #cceede",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              marginBottom: "6px",
              color: "#2f7a5a",
            }}
          >
            🤖 AIが提案する回答
          </div>
          {loadingAiAnswer && (
            <div
              style={{
                fontSize: "12px",
                color: "#2f7a5a",
                marginBottom: "6px",
              }}
            >
              生成中…
            </div>
          )}
          {aiAnswers.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {aiAnswers.map((a, idx) => (
                <button
                  key={idx}
                  onClick={() => setContent(a)}
                  style={{
                    fontSize: "13px",
                    padding: "6px 10px",
                    borderRadius: "16px",
                    border: "1px solid #9fdac0",
                    background: "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e6fff3";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {/* メッセージ一覧 */}
      <div
        style={{
          fontSize: "13px",
          fontWeight: "bold",
          color: "#555",
          marginBottom: "6px",
        }}
      >
        💬 メッセージ履歴
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 2px",
          marginBottom: 0,
        }}
      >
        {sending && (
          <div
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#888",
              margin: "8px 0",
            }}
          >
            送信中…
          </div>
        )}
        {messages.length === 0 ? (
          <div
            style={{
              color: "#777",
              fontSize: "13px",
              textAlign: "center",
              marginTop: "24px",
            }}
          >
            まだメッセージはありません。
            <br />
            下の入力欄から最初のメッセージを送ってみましょう。
          </div>
        ) : (
          messages.map((m) => {
            const isMine =
              firebaseUser &&
              (m.senderUid === firebaseUser.uid ||
                m.sender?.uid === firebaseUser.uid);
            // Format timestamp if present
            let timestampStr = "";
            if (m.createdAt) {
              try {
                const d = new Date(m.createdAt);
                if (!isNaN(d)) {
                  // Show as HH:mm or YYYY/MM/DD HH:mm if not today
                  const now = new Date();
                  const isToday =
                    d.getFullYear() === now.getFullYear() &&
                    d.getMonth() === now.getMonth() &&
                    d.getDate() === now.getDate();
                  const pad = (n) => n.toString().padStart(2, "0");
                  if (isToday) {
                    timestampStr = `${pad(d.getHours())}:${pad(
                      d.getMinutes()
                    )}`;
                  } else {
                    timestampStr = `${d.getFullYear()}/${pad(
                      d.getMonth() + 1
                    )}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(
                      d.getMinutes()
                    )}`;
                  }
                }
              } catch {}
            }
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMine ? "flex-end" : "flex-start",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    background: isMine ? "#ffe5e9" : "#f7f7fa",
                    color: "#222",
                    padding: "6px 10px",
                    borderRadius: isMine
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                    maxWidth: "75%",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontSize: "15px",
                    lineHeight: 1.6,
                    marginLeft: isMine ? "auto" : "0",
                    marginRight: isMine ? "0" : "auto",
                    textAlign: "left",
                  }}
                >
                  {m.content}
                </span>
                {timestampStr && (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#999",
                      marginTop: "3px",
                      marginLeft: isMine ? "auto" : "6px",
                      marginRight: isMine ? "6px" : "auto",
                      textAlign: isMine ? "right" : "left",
                      display: "block",
                    }}
                  >
                    {timestampStr}
                  </span>
                )}
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
          boxShadow: "0 -2px 6px rgba(0,0,0,0.06)",
          flexShrink: 0,
          marginBottom: "0",
          paddingBottom: "0",
        }}
      >
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            outline: "none",
          }}
          placeholder={
            firebaseUser ? "メッセージを入力" : "ログインすると送信できます"
          }
          disabled={sending || !firebaseUser}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!firebaseUser || !content.trim() || sending}
          style={{
            padding: "0 14px",
            borderRadius: "10px",
            border: "none",
            background: sending
              ? "#ccc"
              : !firebaseUser || !content.trim()
              ? "#aaa"
              : "#e60033",
            color: "white",
            cursor: sending
              ? "wait"
              : !firebaseUser || !content.trim()
              ? "not-allowed"
              : "pointer",
          }}
        >
          {sending ? "送信中…" : "送信"}
        </button>
      </div>
    </div>
  );
};

export default ThreadDetail;
