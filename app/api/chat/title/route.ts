import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "http://localhost:3000",
    "X-OpenRouter-Title": "FreetalkAI",
  },
});

export async function POST(req: Request) {
  const { message } = await req.json();

  const { text } = await generateText({
    model: openrouter.chat("liquid/lfm-2.5-1.2b-thinking:free"),
    prompt: `Summarize the following user message into a short, descriptive 3-5 word title for a chat thread. Do not use quotes or special characters.
    
    User message: "${message}"`,
  });

  return Response.json({ title: text.trim().replace(/^["']|["']$/g, "") });
}
