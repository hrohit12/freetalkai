import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  type JSONSchema7,
  streamText,
  convertToModelMessages,
  type UIMessage,
} from "ai";

// Providers Configuration
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://everydayai.in.net",
    "X-OpenRouter-Title": "EverydayAI",
  },
});

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
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

    // Preserve reasoning_details for OpenRouter multi-turn reasoning and LIMIT history to last 6 messages
    const recentMessages = convertedMessages.slice(-6);
    const recentOriginalMessages = messages.slice(-6);
    
    const finalMessages = recentMessages.map((msg, idx) => {
      const originalMsg = recentOriginalMessages[idx];
      if (msg.role === "assistant" && originalMsg && (originalMsg as any).reasoning_details) {
        return {
          ...msg,
          reasoning_details: (originalMsg as any).reasoning_details,
        };
      }
      return msg;
    });

    const systemPrompt = (system ? system + "\n\n" : "") + "CRITICAL: Always use structured markdown. Every single piece of code, HTML, or script MUST be wrapped in triple backticks with the correct language identifier (e.g. ```html). Never output raw HTML tags outside of code blocks.";

    // Mapping for UI IDs to actual models
    const getProviderModel = (id: string) => {
      if (id === "groq/llama-3.1-70b") return { name: "Groq", model: groq.chat("llama-3.3-70b-versatile") };
      if (id.startsWith("groq/")) return { name: "Groq", model: groq.chat(id.replace("groq/", "")) };
      if (id.startsWith("google/")) return { name: "Gemini", model: google(id.replace("google/", "")) };
      return { name: "OpenRouter", model: openrouter.chat(id) };
    };

    const selectedProvider = getProviderModel(model);

    // We try the selected provider first
    try {
      const result = streamText({
        model: selectedProvider.model,
        messages: finalMessages as any,
        system: systemPrompt,
        maxOutputTokens: 800, // Limit output to save tokens
        tools: {
          ...frontendTools(tools ?? {}),
        },
      });

      return result.toUIMessageStreamResponse({
        sendReasoning: true,
      });
    } catch (error: any) {
      const isRateLimit = error?.message?.toLowerCase().includes("rate limit") ||
        error?.status === 429;

      if (isRateLimit) {
        return new Response(
          `The ${selectedProvider.name} limit has been reached or the API key is expired. Please try switching to a different model in the dropdown!`,
          { status: 500 } // using 500 ensures the UI displays the actual text
        );
      }

      // Fallback logic if it wasn't a rate limit
      console.error(`Selected provider ${selectedProvider.name} failed, trying failover...`, error);

      const fallbacks = [
        { name: "Groq", model: groq.chat("llama-3.3-70b-versatile") },
        { name: "Gemini", model: google("gemini-2.5-flash") },
        { name: "OpenRouter", model: openrouter.chat("liquid/lfm-2.5-1.2b-thinking:free") }
      ].filter(f => f.name !== selectedProvider.name);

      for (const fallback of fallbacks) {
        try {
          const result = streamText({
            model: fallback.model,
            messages: finalMessages as any,
            system: systemPrompt,
            maxOutputTokens: 800, // Limit output to save tokens
            tools: {
              ...frontendTools(tools ?? {}),
            },
          });
          return result.toUIMessageStreamResponse({ sendReasoning: true });
        } catch (e) {
          continue;
        }
      }

      return new Response("All models are currently busy or limited. Please try again later.", { status: 500 });
    }
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(error?.message || "Internal Server Error", { status: 500 });
  }
}