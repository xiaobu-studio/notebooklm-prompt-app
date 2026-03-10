"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultCards, setResultCards] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!topic || !audience) {
      alert("請輸入簡報主題與受眾！");
      return;
    }
    setLoading(true);
    setResultCards([]);
    const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      const [res] = await Promise.all([
        fetch("/api/notebooklm/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, audience }),
        }),
        minLoadingTime,
      ]);
      const data = await res.json();
      if (data.result) {
        // 💡 邏輯：嚴格切割，只保留大步驟
        const cards = data.result
          .split(/\n---\n/)
          .map((str: string) => str.trim())
          .filter((str: string) => str.length > 0);
        setResultCards(cards);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("已複製！");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="text-gray-400 hover:text-blue-600 transition-colors text-sm flex items-center gap-1">← 返回</Link>

        {/* 1. 標題與視覺 */}
        <div className="text-center space-y-4">
          <img src="/icon.png" alt="Logo" className="w-20 h-20 rounded-full mx-auto shadow-md border-4 border-white" />
          <h1 className="text-2xl font-bold">小步的 NotebookLM 產生器</h1>
          <span className="text-[10px] font-mono text-gray-400">v1.0.5</span>
        </div>

        {/* 2. 輸入區 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-5">
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="主題" className="w-full border rounded-xl p-3" />
          <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="受眾" className="w-full border rounded-xl p-3" />
          <button onClick={handleGenerate} disabled={loading} className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3">
            {loading ? (
              <>
                <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>生成中...</span>
              </>
            ) : "開始生成"}
          </button>
        </div>

        {/* 3. 結果卡片區 */}
        {!loading && resultCards.map((cardText, index) => {
          const lines = cardText.split("\n");
          const firstLine = lines[0].trim();
          const isHeader = firstLine.startsWith("###");

          // 💡 優化：如果只有標題，內容就等於標題；否則取標題以外的內容
          const displayTitle = isHeader ? firstLine.replace(/^###\s*/, "").trim() : "";
          let copyContent = isHeader ? lines.slice(1).join("\n").trim() : cardText.trim();

          // 如果 copyContent 是空的，就用 displayTitle 作為複製內容
          if (!copyContent && displayTitle) {
            copyContent = displayTitle.split("：")[1] || displayTitle;
          }

          return (
            <div key={index} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b flex items-center justify-between">
                <span className="font-bold text-slate-700 text-sm">{displayTitle || "生成內容"}</span>
                <button onClick={() => handleCopy(copyContent)} className="bg-white border px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">一鍵複製</button>
              </div>
              <div className="p-6 prose prose-slate max-w-none prose-p:leading-relaxed prose-li:my-0">
                <ReactMarkdown>{copyContent}</ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}