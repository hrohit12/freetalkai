import { createOpenAI } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  type JSONSchema7,
  streamText,
  convertToModelMessages,
  type UIMessage,
} from "ai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://freetalkai.netlify.app",
    "X-OpenRouter-Title": "FreetalkAI",
  },
});

export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return new Response("Missing OPENROUTER_API_KEY environment variable.", { status: 500 });
  }

  try {
    const {
      messages,
      system,
      tools,
      model = "liquid/lfm-2.5-1.2b-thinking:free",
    }: {
      messages: UIMessage[];
      system?: string;
      tools?: Record<string, { description?: string; parameters: JSONSchema7 }>;
      model?: string;
    } = await req.json();

    const convertedMessages = await convertToModelMessages(messages);
    
    // Preserve reasoning_details for OpenRouter multi-turn reasoning
    const finalMessages = convertedMessages.map((msg, idx) => {
      const originalMsg = messages[idx];
      if (msg.role === "assistant" && originalMsg && (originalMsg as any).reasoning_details) {
        return {
          ...msg,
          reasoning_details: (originalMsg as any).reasoning_details,
        };
      }
      return msg;
    });

    const result = streamText({
      model: openrouter.chat(model),
      messages: finalMessages as any,
      system: (system ? system + "\n\n" : "") + "CRITICAL: Always use structured markdown. Every single piece of code, HTML, or script MUST be wrapped in triple backticks with the correct language identifier (e.g. ```html). Never output raw HTML tags outside of code blocks.",
      tools: {
        ...frontendTools(tools ?? {}),
      },
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
