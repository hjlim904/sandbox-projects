import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type MemoryDataPoint, useSseMetric } from "@/hooks/useSseMetric";
import { HardDrive } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MemoryWidgetProps {
  enabled: boolean;
}

export function MemoryWidget({ enabled }: MemoryWidgetProps) {
  const { dataHistory, latestData, isConnected } = useSseMetric<MemoryDataPoint>("memory", enabled);

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">JVM 힙 메모리</CardTitle>
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

      <CardContent className="space-y-4">
        {/* 메모리 사용 요약 & 프로그레스 */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-500 dark:text-slate-400">Used / Max</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {latestData ? `${latestData.usedMb} MB / ${latestData.maxMb} MB` : "0 MB / 0 MB"}
              <span className="ml-2 text-emerald-600 dark:text-emerald-400 text-xs">
                ({latestData?.usagePercentage ?? 0}%)
              </span>
            </span>
          </div>
          {/* 프로그레스 바 */}
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(latestData?.usagePercentage ?? 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Recharts 실시간 Memory Chart */}
        <div className="h-44 w-full">
          {enabled ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="MB" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="usedMb"
                  name="Heap Used (MB)"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#memGrad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
              <span>스트림 구독이 비활성화되었습니다.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
