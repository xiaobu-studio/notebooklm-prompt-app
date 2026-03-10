"use client";

import { useState } from "react";

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
      const res = await fetch("/api/generate", {
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
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 rounded-xl transition-colors disabled:bg-gray-400"
          >
            {loading ? "小步努力撰寫中..." : "生成專屬提示詞"}
          </button>
        </div>

        {/* 3. 結果卡片區 */}
        {resultCards.length > 0 && (
          <div className="space-y-6 pb-10">
            {resultCards.map((cardText, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border relative">
                {/* 獨立複製按鈕 */}
                <button
                  onClick={() => handleCopy(cardText)}
                  className="absolute top-4 right-4 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-sm py-2 px-4 rounded-lg transition-colors"
                >
                  一鍵複製
                </button>
                {/* 顯示內容：為了保留排版，我們使用 whitespace-pre-wrap */}
                <pre className="whitespace-pre-wrap font-sans text-gray-700 mt-6 leading-relaxed">
                  {cardText}
                </pre>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}