import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocketHealth } from "@/hooks/useWebSocketHealth";
import { CheckCircle2, Database, Network, Radio, Send, Terminal, XCircle } from "lucide-react";

interface HealthWidgetProps {
  enabled: boolean;
}

export function HealthWidget({ enabled }: HealthWidgetProps) {
  const { components, logs, isConnected, sendMessage } = useWebSocketHealth(enabled);

  const r2dbc = components["R2DBC-H2"];
  const auth = components["AUTH-SERVICE"];

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">컴포넌트 헬스 & WebSocket 진단</CardTitle>
              <CardDescription className="text-xs">양방향 인터랙티브 WebSocket (/ws/dashboard/health)</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600"
              }`}
            />
            <span className={isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}>
              {isConnected ? "WS CONNECTED" : "DISCONNECTED"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 컴포넌트 상태 배지 2개 */}
        <div className="grid grid-cols-2 gap-3">
          {/* R2DBC DB */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">R2DBC DB</span>
            </div>
            <div className="flex items-center gap-1">
              {r2dbc?.status === "UP" ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="h-3.5 w-3.5" /> UP ({r2dbc.responseTimeMs}ms)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  <XCircle className="h-3.5 w-3.5" /> {r2dbc?.status ?? "CHECKING"}
                </span>
              )}
            </div>
          </div>

          {/* Auth Service */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Auth Service</span>
            </div>
            <div className="flex items-center gap-1">
              {auth?.status === "UP" ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="h-3.5 w-3.5" /> UP ({auth.responseTimeMs}ms)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                  <XCircle className="h-3.5 w-3.5" /> {auth?.status ?? "DOWN"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 양방향 인터랙션 버튼 */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!isConnected}
            onClick={() => sendMessage("PING")}
            className="text-xs gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>PING 테스트</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!isConnected}
            onClick={() => sendMessage("CHECK:AUTH-SERVICE")}
            className="text-xs gap-1.5"
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Auth 서버 즉시 진단</span>
          </Button>
        </div>

        {/* 실시간 웹소켓 터미널 로그 */}
        <div className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-xs h-36 overflow-y-auto space-y-1 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 pb-1 border-b border-slate-800">
            <Terminal className="h-3.5 w-3.5" />
            <span>WebSocket Live Stream Console</span>
          </div>
          {logs.length === 0 ? (
            <div className="text-slate-600 pt-2">수신 대기 중...</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex gap-2">
                <span className="text-slate-600">[{log.time}]</span>
                <span
                  className={
                    log.type === "success"
                      ? "text-emerald-400"
                      : log.type === "error"
                      ? "text-rose-400"
                      : log.type === "ping"
                      ? "text-indigo-400"
                      : "text-slate-300"
                  }
                >
                  {log.text}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
