export default function Portal() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-2xl font-bold mb-8">小步學習：AI 提示詞工具箱</h1>
            <div className="space-y-4">
                <a href="/notebooklm" className="block p-6 bg-white rounded-xl shadow border hover:border-blue-500 transition-all">
                    <h2 className="font-bold">📘 NotebookLM 簡報提示詞產生器</h2>
                    <p className="text-sm text-gray-500">快速生成完美的簡報探索與大綱指令</p>
                </a>
                {/* 未來可以再增加其他工具的卡片 */}
                <div className="p-6 bg-gray-100 rounded-xl border border-dashed text-gray-400">
                    🚧 更多工具開發中...
                </div>
            </div>
        </div>
    );
}