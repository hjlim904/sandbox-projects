import { useState, useCallback } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  toolCall?: {
    name: string;
    description: string;
  };
  isThinking?: boolean;
}

const BASE_URL = "http://localhost:8082";

export function useAgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      content:
        "안녕하세요! 백엔드 시스템 진단 및 상태 관리를 지원하는 AI 에이전트입니다.\n\n'현재 CPU와 메모리 사용량 알려줘' 또는 'R2DBC DB 연결 상태 점검해줘'처럼 시스템에 대해 질문해보세요!",
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || isStreaming) return;

      const userMsgId = Date.now().toString();
      const botMsgId = (Date.now() + 1).toString();

      // 1. 유저 메시지 및 빈 봇 메시지 추가
      const newUserMsg: ChatMessage = { id: userMsgId, role: "user", content: userInput };
      const newBotMsg: ChatMessage = { id: botMsgId, role: "model", content: "", isThinking: true };

      setMessages((prev) => [...prev, newUserMsg, newBotMsg]);
      setIsStreaming(true);

      // 서버에 보낼 대화 히스토리 (단순 role/content 포맷)
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      try {
        const response = await fetch(`${BASE_URL}/api/agent/chat/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userInput, history }),
        });

        if (!response.ok || !response.body) {
          throw new Error("AI 서버와 연결할 수 없습니다.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data:")) {
              const jsonStr = line.replace("data:", "").trim();
              if (!jsonStr) continue;

              try {
                const event = JSON.parse(jsonStr); // { type, content, toolName }

                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id !== botMsgId) return msg;

                    if (event.type === "THINKING") {
                      return { ...msg, isThinking: true };
                    } else if (event.type === "TOOL_CALL") {
                      return {
                        ...msg,
                        isThinking: false,
                        toolCall: {
                          name: event.toolName,
                          description: event.content,
                        },
                      };
                    } else if (event.type === "TEXT_CHUNK") {
                      return {
                        ...msg,
                        isThinking: false,
                        content: msg.content + event.content,
                      };
                    } else if (event.type === "ERROR") {
                      return {
                        ...msg,
                        isThinking: false,
                        content: msg.content + `\n\n> 오류: ${event.content}`,
                      };
                    } else if (event.type === "DONE") {
                      return { ...msg, isThinking: false };
                    }
                    return msg;
                  })
                );
              } catch (e) {
                console.error("SSE JSON parse error", e);
              }
            }
          }
        }
      } catch (err: any) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId
              ? { ...msg, isThinking: false, content: `> 통신 에러: ${err.message}` }
              : msg
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming]
  );

  const clearMessages = () => {
    setMessages([
      {
        id: "welcome",
        role: "model",
        content: "대화 내용이 초기화되었습니다. 새로운 질문을 입력해주세요!",
      },
    ]);
  };

  return { messages, isStreaming, sendMessage, clearMessages };
}
