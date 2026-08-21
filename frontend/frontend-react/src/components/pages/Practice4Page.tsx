import { useState, useRef, useEffect } from "react";
import { useAgentChat } from "@/hooks/useAgentChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Wrench,
  Trash2,
  Cpu,
  Database,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function Practice4Page() {
  const { messages, isStreaming, sendMessage, clearMessages } = useAgentChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
  };

  // 빠른 질문 프리셋 버튼들
  const quickQuestions = [
    { text: "현재 CPU 및 메모리 사용량 상태 알려줘", icon: Cpu },
    { text: "R2DBC DB 및 Auth 서버 헬스 체크해줘", icon: Database },
    { text: "백엔드 전반적인 시스템 이상 여부 진단해줘", icon: Activity },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 flex flex-col h-[calc(100vh-8rem)]">
      {/* 1. 상단 타이틀 배너 */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-5 rounded-2xl shadow-lg border border-purple-500/20 flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold border border-purple-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Google Gemini + Function Calling</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            AI 시스템 진단 에이전트
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Spring WebFlux의 도구(Tool)를 직접 실행하여 백엔드 리소스를 실시간 진단합니다.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearMessages}
          className="text-xs gap-1 text-slate-300 border-slate-700 hover:bg-slate-800"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">대화 비우기</span>
        </Button>
      </div>

      {/* 2. 대화 메시지 영역 */}
      <Card className="flex-1 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col bg-white dark:bg-slate-950">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* 봇 아바타 */}
              {msg.role === "model" && (
                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div className={`space-y-2 max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
                {/* ⚙️ Tool Calling 실행 배지 */}
                {msg.toolCall && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs font-mono animate-in fade-in">
                    <Wrench className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
                    <span>[Tool Executed] <strong>{msg.toolCall.name}</strong></span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-1" />
                  </div>
                )}

                {/* 메시지 말풍선 */}
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200/60 dark:border-slate-800"
                  }`}
                >
                  {msg.isThinking && !msg.content ? (
                    <div className="flex items-center gap-2 text-slate-500 text-xs py-1">
                      <span className="h-2 w-2 rounded-full bg-purple-500 animate-ping" />
                      <span>에이전트가 질문을 분석하고 적절한 도구를 찾는 중입니다...</span>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>

              {/* 유저 아바타 */}
              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-1">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* 3. 빠른 질문 칩 & 입력창 */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          {/* 빠른 질문 프리셋 */}
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => {
              const Icon = q.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isStreaming}
                  onClick={() => sendMessage(q.text)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  <Icon className="h-3 w-3 text-purple-500" />
                  <span>{q.text}</span>
                </button>
              );
            })}
          </div>

          {/* 질문 입력 폼 */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="시스템 상태나 질문을 입력하세요... (예: '현재 서버 리소스 괜찮아?')"
              disabled={isStreaming}
              className="text-sm bg-white dark:bg-slate-950"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 px-4 shrink-0"
            >
              <Send className="h-4 w-4" />
              <span>전송</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}