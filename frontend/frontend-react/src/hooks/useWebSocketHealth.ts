import { useEffect, useRef, useState, useCallback } from "react";

export interface HealthMetric {
  componentName: string;
  status: "UP" | "DOWN";
  responseTimeMs: number;
  details?: string;
}

export interface LogMessage {
  id: string;
  time: string;
  text: string;
  type: "info" | "success" | "error" | "ping";
}

const WS_URL = "ws://localhost:8082/ws/dashboard/health";

export function useWebSocketHealth(enabled: boolean) {
  const [components, setComponents] = useState<Record<string, HealthMetric>>({});
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const addLog = useCallback((text: string, type: LogMessage["type"]) => {
    const time = new Date().toLocaleTimeString("ko-KR", { hour12: false });
    setLogs((prev) => [
      { id: Math.random().toString(36).substring(7), time, text, type },
      ...prev.slice(0, 30), // 최대 30줄 로그
    ]);
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      addLog("WebSocket 연결 성공 (/ws/dashboard/health)", "success");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.componentName) {
          setComponents((prev) => ({
            ...prev,
            [data.componentName]: data,
          }));
          addLog(`[Health 수신] ${data.componentName} : ${data.status} (${data.responseTimeMs}ms)`, "info");
        } else if (data.event === "PONG") {
          addLog("서버로부터 PONG 응답 수신", "ping");
        }
      } catch (err) {
        console.error("WS parse error", err);
      }
    };

    ws.onerror = () => {
      setIsConnected(false);
      addLog("WebSocket 에러 발생", "error");
    };

    ws.onclose = () => {
      setIsConnected(false);
      addLog("WebSocket 연결 종료", "info");
    };

    return () => {
      ws.close();
    };
  }, [enabled, addLog]);

  // 클라이언트 -> 서버 메시지 전송
  const sendMessage = useCallback((msg: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(msg);
      addLog(`[클라이언트 송신] ${msg}`, "info");
    } else {
      addLog("전송 실패: WebSocket 미연결 상태", "error");
    }
  }, [addLog]);

  return { components, logs, isConnected, sendMessage };
}
