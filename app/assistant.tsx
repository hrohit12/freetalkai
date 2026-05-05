"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { Thread } from "@/components/assistant-ui/thread";
import { Button } from "@/components/ui/button";
import { RotateCcw, ExternalLink, Mail, Camera, Users, Code } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModelProvider, useModel } from "@/lib/ModelContext";

const AssistantContent = () => {
  const { selectedModel } = useModel();
  
  const runtime = useChatRuntime({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    transport: new AssistantChatTransport({
      api: "/api/chat",
      body: { model: selectedModel },
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-dvh w-full flex-col bg-[#fcfcfc] relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px] -z-10" />

        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white/80 backdrop-blur-md px-8 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="text-xl font-bold tracking-tight text-slate-900 transition-opacity hover:opacity-70 cursor-pointer"
            >
              EverydayAI
            </button>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full font-medium text-slate-600 hover:text-indigo-600">
                  <Mail className="size-4" />
                  Contact Us
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-slate-100">
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Connect with me</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem asChild>
                  <a
                    href="https://instagram.com/hrohit12"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-pointer focus:bg-indigo-50 focus:text-indigo-600 transition-colors"
                  >
                    <Camera className="size-4 text-pink-500" />
                    <span className="font-medium">Instagram</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="https://linkedin.com/in/hrohit12"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-pointer focus:bg-indigo-50 focus:text-indigo-600 transition-colors"
                  >
                    <Users className="size-4 text-blue-600" />
                    <span className="font-medium">LinkedIn</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="https://github.com/hrohit12"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-pointer focus:bg-indigo-50 focus:text-indigo-600 transition-colors"
                  >
                    <Code className="size-4 text-slate-900" />
                    <span className="font-medium">GitHub</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => runtime.thread.reset()}
              className="gap-2 rounded-full border-slate-200 bg-white px-5 py-5 transition-all hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 shadow-sm"
            >
              <RotateCcw className="size-3.5" />
              <span className="font-semibold text-sm">Clear Session</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-hidden z-0">
          <Thread />
        </main>
      </div>
    </AssistantRuntimeProvider>
  );
};

export const Assistant = () => {
  return (
    <ModelProvider>
      <AssistantContent />
    </ModelProvider>
  );
};
