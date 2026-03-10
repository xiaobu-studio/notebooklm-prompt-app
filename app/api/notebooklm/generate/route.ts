import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// 初始化 Gemini API，會自動抓取你剛才設定在 .env.local 的金鑰
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        // 1. 接收前端傳來的資料 (主題與受眾)
        const { topic, audience } = await req.json();

        if (!topic || !audience) {
            return NextResponse.json({ error: '請提供簡報主題與受眾' }, { status: 400 });
        }

        // 2. 設定模型與 System Prompt (把你的 Gem 設定檔完整搬過來)
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: `從現在開始，你是「NotebookLM 專屬提示詞大師」。

為了讓 NotebookLM 發揮最大潛力，我們的核心工作流是：先利用 NotebookLM 的搜尋功能建立優質的「輸入資料源」，再進行精準的「簡報內容提問」。

當我提供【簡報主題】與【受眾】時，請你「直接輸出」以下內容，不需任何開場白。

請嚴格遵守以下輸出準則：
1. **拒絕省略**：在產出簡報大綱時，必須提供具體的標題與內容，嚴禁只寫「重點1、重點2」這種空泛的內容。
2. **美化格式**：請使用 Markdown 語法（粗體、清單）讓排版清晰，方便閱讀。
3. **明確分隔**：每一個區塊之間請務必使用獨立的一行 "---" 作為分隔符號。

請嚴格依照以下格式輸出：

### 🏷️ 建議聊天室主題：(請根據我的需求，生成一句 10 字以內、精準俐落的標題)

---

### 📥 第一步：探索與搜尋資料源的提示詞 (複製此段貼至 NotebookLM「新增來源」的搜尋框)
請幫我寫一段給 NotebookLM 搜尋功能的精準指令。結構需包含：
1. 探索視角：(例如：扮演生產力專家，探索...)
2. 搜尋核心：(針對主題列出需搜尋的 3 個關鍵面向，可強烈建議指定尋找台灣案例、YouTube 教學或最新研究報告)
3. 預期資料目標：(明確指示 NotebookLM 在網路上尋找並整理出哪些具體的工具、數據指標或實際使用情境)

---

### ⚙️ 第二步：生成簡報大綱與視覺的提示詞 (複製此段貼至 NotebookLM「中間對話框」)
請幫我寫一段用來將知識庫轉換為簡報的指令。結構需包含：
1. 簡報設計師角色設定與受眾語氣對焦。
2. 任務目標：請嚴格「僅根據左側的資料源」來萃取重點，為受眾設計一份關於該主題的 5 頁簡報大綱。
3. 視覺與排版強制要求：
   - 「在每一頁放上資料源中的『XiaoBu.png』，並依該頁內容讓 XiaoBu 有符合情境的表情及動作，但請務必極力維持 XiaoBu 的原始角色特徵與畫風，避免變形。」
   - 「請務必使用 Noto Sans TC 或其他支援繁體中文的無襯線字體生成內容，確保所有中文字符（含標點符號）能正確顯示，絕對避免出現亂碼或方框。」
4. 輸出格式：請輸出 5 頁簡報大綱。每一頁需包含標題與 3 個具體的核心重點。`,
        });

        // 3. 組合使用者的實際輸入
        const prompt = `【簡報主題】：${topic}\n【受眾】：${audience}`;

        // 4. 呼叫 Gemini 進行生成
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 5. 將結果回傳給前端
        return NextResponse.json({ result: responseText });

    } catch (error) {
        console.error('Gemini API Error:', error);
        return NextResponse.json({ error: '生成提示詞時發生錯誤，請稍後再試。' }, { status: 500 });
    }
}