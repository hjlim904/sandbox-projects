import { useEffect, useState } from "react";

export interface CpuDataPoint {
  time: string;
  processCpuUsage: number;
  systemCpuUsage: number;
}

export interface MemoryDataPoint {
  time: string;
  usedMb: number;
  maxMb: number;
  usagePercentage: number;
}

export interface ThreadDataPoint {
  time: string;
  liveThreads: number;
  peakThreads: number;
  daemonThreads: number;
}

const BASE_URL = "http://localhost:8082";

export function useSseMetric<T>(endpoint: string, enabled: boolean) {
  const [dataHistory, setDataHistory] = useState<T[]>([]);
  const [latestData, setLatestData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return;
    }

    const eventSource = new EventSource(`${BASE_URL}/api/dashboard/stream/${endpoint}`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    const handleData = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        const timeStr = new Date().toLocaleTimeString("ko-KR", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const formatted = {
          ...parsed,
          time: timeStr,
          ...(parsed.usedBytes !== undefined && {
            usedMb: Math.round(parsed.usedBytes / (1024 * 1024)),
            maxMb: Math.round(parsed.maxBytes / (1024 * 1024)),
          }),
        };

        setLatestData(formatted);
        setDataHistory((prev) => {
          const next = [...prev, formatted];
          return next.length > 20 ? next.slice(next.length - 20) : next; // 최근 20개 데이터 유지
        });
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    eventSource.addEventListener(`${endpoint}-metric`, handleData);
    eventSource.addEventListener("message", handleData);
    eventSource.onmessage = handleData;

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [endpoint, enabled]);

  return { dataHistory, latestData, isConnected };
}
