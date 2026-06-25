"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "bot";
  text: string;
  category?: string;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "مرحباً بيك في Hegawy Store! 🌟 أنا مساعدك الافتراضي. تقدر تسألني عن أي حاجة بخصوص المتاجر الإلكترونية والخدمات بتاعتنا." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((p) => [...p, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, sessionId, history }),
      });
      const data = await res.json();

      setMessages((p) => [
        ...p,
        {
          role: "bot",
          text: data.reply,
          category: data.category,
        },
      ]);
    } catch {
      setMessages((p) => [...p, { role: "bot", text: "عذراً، حصل خطأ في الاتصال." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 20, fontFamily: "Tahoma, sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, color: "#1a73e8" }}>🤖 Hegawy Store AI Bot</h1>
        <p style={{ color: "#666" }}>مدعوم بـ DeepSeek V4 Flash</p>
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          height: 400,
          overflowY: "auto",
          background: "#f9f9f9",
          marginBottom: 16,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: 12,
                background: m.role === "user" ? "#1a73e8" : "#fff",
                color: m.role === "user" ? "#fff" : "#333",
                border: m.role === "bot" ? "1px solid #ddd" : "none",
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.text}
              {m.category && m.role === "bot" && (
                <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                  {m.category === "زبون" && "🛒 زبون"}
                  {m.category === "عامل" && "🔧 عامل"}
                  {m.category === "توظيف" && "💼 توظيف"}
                  {m.category === "اداري" && "⚙️ أمر إداري"}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div style={{ textAlign: "center", color: "#999", fontSize: 13 }}>يكتب...</div>}
        <div ref={endRef} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="اكتب رسالتك هنا..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 14,
            direction: "rtl",
          }}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "#1a73e8",
            color: "#fff",
            fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          إرسال
        </button>
      </div>
    </div>
  );
}
