import express from "express";
import path from "path";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API: Geography AI Tutor Chat with High Thinking
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, currentCountry } = req.body;
    const ai = getGeminiClient();
    
    // Build context
    const countryContext = currentCountry 
      ? `현재 학생이 탐색 중인 국가는 [${currentCountry.name}]입니다. (수도: ${currentCountry.capital}, 기후: ${currentCountry.climate}, 언어: ${currentCountry.language}, 인구: ${currentCountry.population}, 지리 특징: ${currentCountry.geoFeatures}, 특별한 특징: ${currentCountry.specialFeature})`
      : '현재 특정 국가를 선택하지 않고 탐색 중입니다.';

    const systemInstruction = `너는 초등학교 6학년 학생들을 대상으로 유럽과 아프리카의 세계 지리를 쉽고 재미있게 가르쳐 주는 친절한 '지리 박사님(AI 튜터)'이야.
학생들이 유럽이나 아프리카 나라에 대해 물어보면, 초등학교 6학년 사회(지리) 수준에 맞추어 친근하고 다정하게 존댓말(~해요, ~랍니다)로 대답해 줘.

[상호작용 원칙]
1. 답변은 사실에 근거해 100% 정확하고 신뢰할 수 있어야 해. 지어내거나 추측해서 가르치면 안 돼.
2. 초등학생 눈높이에 맞게 흥미롭고 귀여운 비유나 상식(예: 피오르 해안이 만들어지는 원리를 조각 케이크나 슬러시에 비유 등)을 적극적으로 활용해 줘.
3. 어려운 전문 용어나 한자어는 반드시 괄호나 쉬운 해설을 덧붙여서 아이들이 쉽게 이해할 수 있도록 도와줘.
4. 외교부 안전여행 정보(https://www.0404.go.kr) 및 국가 안전에 대한 질문을 받으면 실제 안전 등급과 함께 아이들에게 어떻게 행동해야 하는지 안전 수칙을 명확히 알려줘.
5. 현재 탐색 상황: ${countryContext}

대답은 활기차고 다정한 인사와 함께 시작하고, 가독성을 높이기 위해 마크다운 줄바꿈이나 이모티콘을 적극 활용해줘.`;

    const formattedContents = [];
    
    // Add user/model history
    if (history && history.length > 0) {
      for (const h of history) {
        formattedContents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      }
    }
    
    // Add latest user message
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview", // Use thinking model for deep, high-quality reasoning
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH // Enable High Thinking for complex educational answers!
        }
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "AI 튜터 서버에 에러가 발생했습니다." });
  }
});

// Setup Vite or serve production files
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== "1" && process.env.VERCEL !== "true") {
  initServer();
}

export default app;
