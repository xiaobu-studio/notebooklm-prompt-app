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
    setResultCards([]); // 清空舊的結果

    try {
      const res = await fetch("/api/notebooklm/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, audience }),
      });

      const data = await res.json();

      if (data.result) {
        // 利用你在 Prompt 裡設定的 "---" 分隔符號，將回傳字串切成獨立的卡片
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
    alert("已複製到剪貼簿！可以貼去 NotebookLM 囉！");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 👇 返回連結 */}
        <div className="mb-6">
          <Link href="/" className="text-gray-400 hover:text-blue-600 transition-colors text-sm flex items-center gap-1">
            ← 返回工具箱首頁
          </Link>
        </div>

        {/* 1. 標題與視覺區 */}
        <div className="text-center space-y-2 pt-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl text-gray-500 font-bold mx-auto mb-4">
            小
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            小步的 NotebookLM 簡報提示詞產生器
          </h1>
          <p className="text-gray-500">
            輸入主題與受眾，為你生成完美的 NotebookLM 提示詞
          </p>
        </div>

        {/* 2. 輸入區 */}
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
            className="w-full bg-gray-800 hover:bg-black text-white font-bold py-4 rounded-xl transition-all disabled:bg-gray-400 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                {/* 這是 Tailwind 內建的旋轉動畫 SVG */}
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>小步正在努力撰寫中...</span>
              </>
            ) : (
              "生成專屬提示詞"
            )}
          </button>
        </div>

        {/* 3. 載入中的骨架屏 (Skeleton) */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                  <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. 原本的結果卡片區 (確保 loading 結束後才顯示) */}
        {!loading && resultCards.length > 0 && (
          <div className="space-y-6 pb-10">
            {/* ... 這裡維持你剛剛改好的卡片邏輯 ... */}
          </div>
        )}

        {/* 4. 結果卡片區 */}
        {resultCards.length > 0 && (
          <div className="space-y-6 pb-10">
            {resultCards.map((cardText, index) => {
              // 💡 核心邏輯：將第一行當作「畫面標題」，剩下的才是「要複製的內容」
              const lines = cardText.split("\n");
              const hasHeader = lines[0].startsWith("###");

              // 如果有 ### 開頭的標題且不只一行，就把第一行拆出來
              const displayTitle = hasHeader ? lines[0].replace("### ", "") : "";
              const copyContent = (hasHeader && lines.length > 1)
                ? lines.slice(1).join("\n").trim()
                : cardText.replace("### ", "").trim();

              return (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border relative group">

                  {/* 畫面顯示的藍色小標題 (不會被複製) */}
                  {displayTitle && (
                    <div className="text-blue-700 font-bold mb-4 pb-3 border-b border-blue-50 flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {index === 0 ? "建議" : "提示詞"}
                      </span>
                      {displayTitle}
                    </div>
                  )}

                  {/* 一鍵複製按鈕：只帶入 copyContent */}
                  <button
                    onClick={() => handleCopy(copyContent)}
                    className="absolute top-4 right-4 bg-gray-800 hover:bg-black text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm transition-all"
                  >
                    一鍵複製
                  </button>

                  {/* 提示詞內容區 */}
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