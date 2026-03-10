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
    alert("已複製到剪貼簿！");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* 返回連結 */}
        <div className="mb-6">
          <Link href="/" className="text-gray-400 hover:text-blue-600 transition-colors text-sm flex items-center gap-1">
            ← 返回工具箱首頁
          </Link>
        </div>

        {/* 1. 標題與視覺區 (恢復原本的層次) */}
        <div className="text-center space-y-2 pt-8">
          <img
            src="/icon.png"
            alt="Logo"
            className="w-20 h-20 rounded-full mx-auto shadow-md border-4 border-white object-cover mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800">
            小步的 NotebookLM 簡報提示詞產生器
          </h1>
          <p className="text-gray-500">
            輸入主題與受眾，為你生成完美的 NotebookLM 提示詞
          </p>
        </div>

        {/* 2. 版本號 (回到右上方小小的) */}
        <div className="flex justify-end mb-1 px-2">
          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
            v1.0.6
          </span>
        </div>

        {/* 3. 輸入區 (標籤與 Placeholder 全數回歸) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              1. 簡報主題
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：AI 工具提升學習與工作效率"
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              2. 目標受眾
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="例如：非技術背景的上班族、國中生..."
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>正在構思精采內容...</span>
              </>
            ) : (
              "生成專屬提示詞"
            )}
          </button>
        </div>

        {/* 4. 載入中的骨架屏 */}
        {loading && (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                  <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. 結果卡片區 (保留 Markdown 渲染與正確解析) */}
        {!loading && resultCards.length > 0 && (
          <div className="space-y-6 pb-10">
            {resultCards.map((cardText, index) => {
              const lines = cardText.split("\n");
              const firstLine = lines[0].trim();
              const isHeader = firstLine.startsWith("###");

              const displayTitle = isHeader ? firstLine.replace(/^###\s*/, "").trim() : "";
              let copyContent = isHeader ? lines.slice(1).join("\n").trim() : cardText.trim();

              if (!copyContent && displayTitle) {
                copyContent = displayTitle.split("：")[1] || displayTitle;
              }

              return (
                <div key={index} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        {index === 0 ? "建議" : "指令"}
                      </span>
                      <span className="font-bold text-slate-700 text-sm">{displayTitle || "生成內容"}</span>
                    </div>
                    <button onClick={() => handleCopy(copyContent)} className="bg-white border px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50">
                      一鍵複製
                    </button>
                  </div>
                  <div className="p-6 prose prose-slate max-w-none text-gray-800 leading-relaxed">
                    <ReactMarkdown>{copyContent}</ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}