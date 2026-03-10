"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown"; // 💡 引入美化套件

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

    // 💡 增加最低載入時間，確保使用者能看到動畫
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
        // 💡 邏輯優化：分割符號改得更寬容，並確保內容不被截斷
        const cards = data.result
          .split(/[\n\r]+---[\n\r]+/)
          .map((str: string) => str.trim())
          .filter((str: string) => str.length > 0);
        setResultCards(cards);
      } else {
        alert(data.error || "發生錯誤");
      }
    } catch (error) {
      console.error(error);
      alert("系統發生錯誤，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("已複製到剪貼簿！");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">

        <Link href="/" className="text-gray-400 hover:text-blue-600 transition-colors text-sm flex items-center gap-1">
          ← 返回工具箱首頁
        </Link>

        {/* 1. 標題區 */}
        <div className="text-center space-y-4">
          <img src="/icon.png" alt="Logo" className="w-20 h-20 rounded-full mx-auto shadow-md border-4 border-white object-cover" />
          <h1 className="text-3xl font-bold text-gray-800">小步的 NotebookLM 提示詞產生器</h1>
          <p className="text-gray-500">v1.0.4 - 專業渲染版</p>
        </div>

        {/* 2. 輸入區 */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">1. 簡報主題</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="例如：實用的 AI 工作術" className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">2. 目標受眾</label>
              <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="例如：上班族、國中生" className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-md"
          >
            {loading ? (
              <>
                {/* 💡 重新設計更顯眼的旋轉動畫 */}
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>正在構思精采內容...</span>
              </>
            ) : "立即生成專屬提示詞"}
          </button>
        </div>

        {/* 3. 載入中動畫 */}
        {loading && (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-100 rounded w-full"></div>
                <div className="h-3 bg-gray-100 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        )}

        {/* 4. 結果卡片區 */}
        {!loading && resultCards.length > 0 && (
          <div className="space-y-8 pb-20">
            {resultCards.map((cardText, index) => {
              const lines = cardText.split("\n");
              const firstLine = lines[0].trim();
              const isHeader = firstLine.startsWith("###");
              const displayTitle = isHeader ? firstLine.replace(/^###\s*/, "").trim() : "";
              const copyContent = isHeader ? lines.slice(1).join("\n").trim() : cardText.trim();

              return (
                <div key={index} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                  {displayTitle && (
                    <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                          {index === 0 ? "建議" : "指令"}
                        </span>
                        <span className="font-bold text-blue-900 text-sm">{displayTitle}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(copyContent)}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold text-xs py-1.5 px-3 rounded-lg shadow-sm transition-all"
                      >
                        一鍵複製
                      </button>
                    </div>
                  )}

                  {/* 💡 這裡換成 ReactMarkdown，讓內容變美！ */}
                  <div className="p-6 prose prose-sm max-w-none text-gray-800 leading-relaxed">
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