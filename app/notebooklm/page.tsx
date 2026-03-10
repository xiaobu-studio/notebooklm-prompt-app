"use client";

import { useState } from "react";
import Link from "next/link";

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

    // 強制動畫至少跑 1.2 秒，增加「小步正在思考」的質感
    const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 1200));

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
          .split("---")
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
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* 返回連結 */}
        <div className="mb-2">
          <Link href="/" className="text-gray-400 hover:text-blue-600 transition-colors text-sm flex items-center gap-1">
            ← 返回工具箱首頁
          </Link>
        </div>

        {/* 1. 標題與視覺區 */}
        <div className="text-center space-y-4 pt-4">
          <img
            src="/icon.png"
            alt="Logo"
            className="w-20 h-20 rounded-full mx-auto shadow-md border-4 border-white object-cover"
          />
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-800">
              小步的 NotebookLM 簡報提示詞產生器
            </h1>
            <p className="text-gray-500">
              輸入主題與受眾，為你生成完美的 NotebookLM 提示詞
            </p>
          </div>
        </div>

        {/* 2. 版本號 */}
        <div className="flex justify-end mb-1 px-2">
          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
            v1.0.2
          </span>
        </div>

        {/* 3. 輸入區 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">1. 簡報主題</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：職場上實用的 AI 工具"
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">2. 目標受眾</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="例如：上班族"
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
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>小步正在努力撰寫中...</span>
              </>
            ) : "生成專屬提示詞"}
          </button>
        </div>

        {/* 4. 載入中的骨架屏 */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. 結果卡片區 (確保 loading 結束後顯示) */}
        {!loading && resultCards.length > 0 && (
          <div className="space-y-6 pb-10">
            {resultCards.map((cardText, index) => {
              // 💡 魯棒的拆分邏輯：找第一個冒號
              const cleanCardText = cardText.replace(/^###\s*/gm, "");
              const lines = cleanCardText.split('\n');
              const firstLine = lines[0].trim();

              let displayTitle = "";
              let copyContent = cleanCardText;

              if (firstLine.includes("：")) {
                const parts = firstLine.split("：");
                displayTitle = parts[0].trim();
                // 合併剩餘的第一行內容與其他行
                const firstLineBody = parts.slice(1).join("：").trim();
                copyContent = [firstLineBody, ...lines.slice(1)].join("\n").trim();
              }

              return (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border relative group">
                  {displayTitle && (
                    <div className="text-blue-700 font-bold mb-4 pb-3 border-b border-blue-50 flex items-center gap-2 text-sm">
                      <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {index === 0 ? "建議" : "提示詞"}
                      </span>
                      {displayTitle}
                    </div>
                  )}

                  <button
                    onClick={() => handleCopy(copyContent)}
                    className="absolute top-4 right-4 bg-gray-800 hover:bg-black text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm transition-all"
                  >
                    一鍵複製
                  </button>

                  <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-sm">
                    {copyContent}
                  </pre>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}