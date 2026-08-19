import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type CpuDataPoint, useSseMetric } from "@/hooks/useSseMetric";
import { Activity, Cpu } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface CpuWidgetProps {
  enabled: boolean;
}

export function CpuWidget({ enabled }: CpuWidgetProps) {
  const { dataHistory, latestData, isConnected } = useSseMetric<CpuDataPoint>("cpu", enabled);

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">CPU 사용률</CardTitle>
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
        {/* 현재 수치 요약 */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="text-xs text-slate-500 dark:text-slate-400">Process CPU</div>
            <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
              {latestData ? `${latestData.processCpuUsage}%` : "0.0%"}
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="text-xs text-slate-500 dark:text-slate-400">System CPU</div>
            <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {latestData ? `${latestData.systemCpuUsage}%` : "0.0%"}
            </div>
          </div>
        </div>

        {/* Recharts 실시간 Area Chart */}
        <div className="h-44 w-full">
          {enabled ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="processCpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="systemCpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
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
                  dataKey="processCpuUsage"
                  name="Process CPU (%)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#processCpuGrad)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="systemCpuUsage"
                  name="System CPU (%)"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  fillOpacity={1}
                  fill="url(#systemCpuGrad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
              <Activity className="h-6 w-6 mb-1 opacity-50" />
              <span>스트림 구독이 비활성화되었습니다.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
