import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://everydayai.in.net",
    "X-OpenRouter-Title": "EverydayAI",
  },
});

export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return new Response("Missing OPENROUTER_API_KEY environment variable.", { status: 500 });
  }

  try {
    const { message, model = "liquid/lfm-2.5-1.2b-thinking:free" } = await req.json();

    const { text } = await generateText({
      model: openrouter.chat(model),
      prompt: `Summarize the following user message into a short, descriptive 3-5 word title for a chat thread. Do not use quotes or special characters.
      
      User message: "${message}"`,
    });

    return Response.json({ title: text.trim().replace(/^["']|["']$/g, "") });
  } catch (error) {
    console.error("Title API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
