"use client";

import { useState, useEffect } from "react"; // 💡 新增 useEffect
import Link from "next/link";
import ReactMarkdown from "react-markdown";

// 💡 定義歷史紀錄的資料結構
interface HistoryRecord {
  id: number;
  topic: string;
  audience: string;
  cards: string[];
  date: string;
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultCards, setResultCards] = useState<string[]>([]);

  // 💡 新增 history 狀態
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // 💡 網頁初次載入時，從 localStorage 讀取紀錄
  useEffect(() => {
    const savedHistory = localStorage.getItem("notebooklm_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("讀取歷史紀錄失敗", e);
      }
    }
  }, []);

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
        let cards = data.result
          .split(/\n\s*---\s*\n/)
          .map((str: string) => str.trim())
          .filter((str: string) => str.length > 0);

        if (cards.length > 3) {
          const combinedStep2 = cards.slice(2).join("\n\n");
          cards = [cards[0], cards[1], combinedStep2];
        }

        setResultCards(cards);

        // 💡 成功生成後，儲存到 localStorage
        const newRecord: HistoryRecord = {
          id: Date.now(),
          topic,
          audience,
          cards,
          date: new Date().toLocaleString("zh-TW", { hour12: false }),
        };

        // 保留最新的 5 筆紀錄
        const updatedHistory = [newRecord, ...history].slice(0, 5);
        setHistory(updatedHistory);
        localStorage.setItem("notebooklm_history", JSON.stringify(updatedHistory));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("已複製！");
  };

  // 💡 點擊歷史紀錄時，載入該筆資料
  const loadHistoryRecord = (record: HistoryRecord) => {
    setTopic(record.topic);
    setAudience(record.audience);
    setResultCards(record.cards);
    window.scrollTo({ top: 0, behavior: "smooth" }); // 貼心設計：自動捲動到最上方
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">

        <Link href="/" className="text-gray-400 hover:text-blue-600 transition-colors text-sm flex items-center gap-1">← 返回工具箱首頁</Link>

        {/* 1. 標題 */}
        <div className="text-center space-y-2 pt-4">
          <img src="/icon.png" alt="Logo" className="w-20 h-20 rounded-full mx-auto shadow-md border-4 border-white mb-4 object-cover" />
          <h1 className="text-3xl font-bold text-gray-800">小步的 NotebookLM 簡報提示詞產生器</h1>
          <p className="text-gray-500">輸入主題與受眾，為你生成完美的 NotebookLM 提示詞</p>
        </div>

        {/* 2. 版本號 */}
        <div className="flex justify-end mb-1 px-2">
          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">v1.1.8</span>
        </div>

        {/* 3. 輸入區 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">1. 簡報主題</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="例如：實用的 AI 工作術" className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">2. 目標受眾</label>
            <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="例如：上班族" className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button onClick={handleGenerate} disabled={loading} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>正在構思精采內容...</span>
              </>
            ) : "生成專屬提示詞"}
          </button>
        </div>

        {/* 4. 骨架屏 */}
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

        {/* 5. 結果區 */}
        {!loading && resultCards.map((cardText, index) => {
          const lines = cardText.split("\n");
          const firstLine = lines[0].trim();
          const isHeader = firstLine.startsWith("###");
          const displayTitle = isHeader ? firstLine.replace(/^###\s*/, "").trim() : "";
          let copyContent = isHeader ? lines.slice(1).join("\n").trim() : cardText.trim();

          if (!copyContent && displayTitle) {
            const colonIndex = displayTitle.indexOf("：");
            copyContent = colonIndex !== -1 ? displayTitle.substring(colonIndex + 1).trim() : displayTitle;
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
                <button onClick={() => handleCopy(copyContent)} className="bg-white hover:bg-gray-50 border px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">一鍵複製</button>
              </div>
              <div className="p-6 prose prose-slate max-w-none prose-p:leading-relaxed prose-li:my-0 text-gray-800 text-sm">
                <ReactMarkdown>{copyContent}</ReactMarkdown>
              </div>
            </div>
          );
        })}

        {/* 💡 6. 歷史紀錄區塊 */}
        {history.length > 0 && !loading && (
          <div className="pt-12 pb-8 border-t border-gray-200 mt-12">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>⏱️</span> 最近生成的提示詞
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((record) => (
                <button
                  key={record.id}
                  onClick={() => loadHistoryRecord(record)}
                  className="text-left bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="text-xs text-gray-400 mb-1">{record.date}</div>
                  <div className="font-bold text-gray-800 group-hover:text-blue-600 truncate">
                    {record.topic}
                  </div>
                  <div className="text-sm text-gray-500 truncate mt-1">
                    受眾：{record.audience}
                  </div>
                </button>
              ))}
            </div>

            {/* 隱私說明小提醒 */}
            <div className="mt-8 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>💡 關於紀錄保存：</strong><br />
                您的生成紀錄僅儲存在此瀏覽器的 <code>localStorage</code> 中，這意味著資料<strong>不會</strong>上傳到雲端伺服器，既保護隱私又能快速讀取。若您清理瀏覽器快取或更換裝置，紀錄將會消失。（最多保留最近 5 筆）
              </p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}