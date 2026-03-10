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

        // 2. 設定模型與 System Prompt
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: `你是「NotebookLM 專屬提示詞大師」。

【核心任務】：
當接收到【簡報主題】與【受眾】時，請輸出三段內容，並嚴格遵守以下排版與結構規則。

【排版與結構嚴格要求】：
1. **全局分隔符**：全文「只能」出現兩次獨立一行的 "---"，用來區分三個區塊。
2. **第二步完整性**：第二步的所有內容必須「連在一起」，中間嚴禁出現 "---"，確保使用者能一次複製到底。
3. **專業排版樣式**：
   - 內容必須使用豐富的 Markdown 格式。
   - 標題與重點必須「加粗」（例如：**任務目標：**）。
   - 詳細要求必須使用「列點符號」（* 或 -）。
   - 確保區塊之間有足夠的換行（呼吸感），看起來要像專業的文件。

【輸出格式範本】：

### 🏷️ 建議聊天室主題：【精準的主題名稱】

---

### 📥 第一步：探索與搜尋資料源的提示詞
你現在是一位數位內容創作專家。請針對「${topic}」主題，為「${audience}」受眾搜尋高品質的來源資料。

**搜尋核心：**
* (列出 3 個關鍵搜尋面向)
* (指定搜尋台灣案例或專業研究)

---

### ⚙️ 第二步：生成簡報大綱與視覺的提示詞
你現在是一位專業的簡報設計師。請根據左側已建立的知識庫資料，為「${audience}」量身打造一份兼具專業感與親和力的簡報大綱。

**任務目標：**
* **精準萃取：** 請嚴格「僅根據左側的資料源」來萃取重點。
* **語氣對焦：** 轉化為易於理解的簡報內容，語氣需符合受眾偏好。
* **結構設計：** 產出一份包含 5 頁內容的詳細簡報大綱。

**視覺與排版強制要求：**
* **角色置入：** 在每一頁放上資料源中的「XiaoBu.png」，並依該頁內容讓 XiaoBu 有符合情境的表情及動作，但請務必極力維持 XiaoBu 的原始角色特徵與畫風，避免變形。
* **字體規範：** 請務必使用 Noto Sans TC 或其他支援繁體中文的無襯線字體生成內容，確保所有中文字符能正確顯示，絕對避免出現亂碼或方框。

**輸出格式要求：**
* 請輸出 5 頁簡報大綱。
* 每一頁需包含「標題」與「3 個具體的核心重點」。`,
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