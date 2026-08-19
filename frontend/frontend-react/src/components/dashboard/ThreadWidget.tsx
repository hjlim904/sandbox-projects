import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ThreadDataPoint, useSseMetric } from "@/hooks/useSseMetric";
import { GitCommit, Layers } from "lucide-react";

interface ThreadWidgetProps {
  enabled: boolean;
}

export function ThreadWidget({ enabled }: ThreadWidgetProps) {
  const { latestData, isConnected } = useSseMetric<ThreadDataPoint>("threads", enabled);

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">JVM 스레드 현황</CardTitle>
              <CardDescription className="text-xs">Server-Sent Events (SSE)</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600"
              }`}
            />
            <span className={isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}>
              {isConnected ? "LIVE" : "DISCONNECTED"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Live Threads</div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {latestData?.liveThreads ?? 0}
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Peak Threads</div>
            <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-200">
              {latestData?.peakThreads ?? 0}
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Daemon</div>
            <div className="text-2xl font-extrabold text-slate-500 dark:text-slate-400">
              {latestData?.daemonThreads ?? 0}
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <GitCommit className="h-4 w-4 text-slate-400" />
          <span>WebFlux Netty 논블로킹 이벤트 루프 스레드가 효율적으로 동작 중입니다.</span>
        </div>
      </CardContent>
    </Card>
  );
}
