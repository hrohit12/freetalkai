import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  type JSONSchema7,
  streamText,
  convertToModelMessages,
  type UIMessage,
} from "ai";

export async function POST(req: Request) {
  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
  const GROQ_KEY = process.env.GROQ_API_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  // Diagnostic check (Safe: only logs presence, not value)
  if (!OPENROUTER_KEY && !GROQ_KEY && !GEMINI_KEY) {
    console.error("CRITICAL: No API keys found in environment variables!");
  }

  // Initialize providers inside the handler to ensure keys are fresh
  const openrouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPENROUTER_KEY,
    headers: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://everydayai.in.net",
      "X-OpenRouter-Title": "EverydayAI",
    },
  });

  const groq = createOpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: GROQ_KEY,
  });

  const google = createGoogleGenerativeAI({
    apiKey: GEMINI_KEY,
  });

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

    // Validate key for selected provider
    if (selectedProvider.name === "OpenRouter" && !OPENROUTER_KEY) {
      return new Response("Configuration Error: OPENROUTER_API_KEY is missing on the server. Please check your deployment environment variables.", { status: 500 });
    }
    if (selectedProvider.name === "Groq" && !GROQ_KEY) {
      return new Response("Configuration Error: GROQ_API_KEY is missing on the server. Please check your deployment environment variables.", { status: 500 });
    }
    if (selectedProvider.name === "Gemini" && !GEMINI_KEY) {
      return new Response("Configuration Error: GEMINI_API_KEY is missing on the server. Please check your deployment environment variables.", { status: 500 });
    }

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
      const errorText = error?.message?.toLowerCase() || "";
      const isRateLimit = errorText.includes("rate limit") || 
                         errorText.includes("quota exceeded") ||
                         errorText.includes("daily limit") ||
                         errorText.includes("failed after 3 attempts") ||
                         errorText.includes("free-models-per-day") ||
                         error?.status === 429;

      // If it's a rate limit, we try fallbacks first instead of immediately failing
      console.error(`Selected provider ${selectedProvider.name} failed (Rate Limit: ${isRateLimit}), trying fallbacks...`, errorText);

      const fallbacks = [
        { name: "Groq", model: groq.chat("llama-3.3-70b-versatile") },
        { name: "Gemini", model: google("gemini-2.0-flash") },
        { name: "OpenRouter", model: openrouter.chat("liquid/lfm-2.5-1.2b-thinking:free") }
      ].filter(f => f.name !== selectedProvider.name);

      for (const fallback of fallbacks) {
        try {
          const result = streamText({
            model: fallback.model,
            messages: finalMessages as any,
            system: systemPrompt,
            maxOutputTokens: 800,
            tools: {
              ...frontendTools(tools ?? {}),
            },
          });
          return result.toUIMessageStreamResponse({ sendReasoning: true });
        } catch (fallbackError: any) {
          console.error(`Fallback ${fallback.name} failed...`);
          continue;
        }
      }

      // If we reach here, EVERYTHING failed. 
      // If the original error was a rate limit, show the specific message.
      if (isRateLimit) {
        return new Response(
          `🚀 You've reached your daily quota or today's rate limit for ${selectedProvider.name}. Please try switching to a different model from the dropdown to continue chatting for free!`,
          { status: 500 }
        );
      }

      return new Response("🔒 All free models have reached their daily limits or are currently busy. Please try switching to another provider from the dropdown!", { status: 500 });
    }
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(error?.message || "Internal Server Error", { status: 500 });
  }
}