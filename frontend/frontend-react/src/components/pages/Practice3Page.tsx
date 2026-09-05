import { useState } from "react";
import { CpuWidget } from "../dashboard/CpuWidget";
import { MemoryWidget } from "../dashboard/MemoryWidget";
import { ThreadWidget } from "../dashboard/ThreadWidget";
import { HealthWidget } from "../dashboard/HealthWidget";
import { Activity, Check, Cpu, HardDrive, Layers, Network, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

export default function Practice3Page() {
  const { t } = useTranslation();
  // 사용자가 보고 싶은 위젯만 개별 선택(구독)할 수 있는 토글 상태
  const [selectedWidgets, setSelectedWidgets] = useState({
    cpu: true,
    memory: true,
    threads: true,
    health: true,
  });

  const toggleWidget = (key: keyof typeof selectedWidgets) => {
    setSelectedWidgets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const enableAll = () => {
    setSelectedWidgets({ cpu: true, memory: true, threads: true, health: true });
  };

  const disableAll = () => {
    setSelectedWidgets({ cpu: false, memory: false, threads: false, health: false });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* 1. 상단 타이틀 & 설명 배너 */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("practice3.badge")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t("practice3.title")}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
            {t("practice3.desc")}
          </p>
        </div>
      </div>

      {/* 2. 유저 맞춤형 위젯 선택 툴바 (개별 스트림 제어) */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Activity className="h-4 w-4 text-indigo-500" />
          <span>{t("practice3.widgetSelect")}</span>
        </div>

        {/* 토글 칩 4개 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* CPU 토글 */}
          <button
            onClick={() => toggleWidget("cpu")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedWidgets.cpu
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>{t("practice3.cpu")}</span>
            {selectedWidgets.cpu && <Check className="h-3.5 w-3.5 ml-0.5" />}
          </button>

          {/* Memory 토글 */}
          <button
            onClick={() => toggleWidget("memory")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedWidgets.memory
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            <HardDrive className="h-3.5 w-3.5" />
            <span>{t("practice3.memory")}</span>
            {selectedWidgets.memory && <Check className="h-3.5 w-3.5 ml-0.5" />}
          </button>

          {/* Threads 토글 */}
          <button
            onClick={() => toggleWidget("threads")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedWidgets.threads
                ? "bg-amber-600 text-white shadow-sm shadow-amber-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{t("practice3.threads")}</span>
            {selectedWidgets.threads && <Check className="h-3.5 w-3.5 ml-0.5" />}
          </button>

          {/* Health 토글 */}
          <button
            onClick={() => toggleWidget("health")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedWidgets.health
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            <span>{t("practice3.health")}</span>
            {selectedWidgets.health && <Check className="h-3.5 w-3.5 ml-0.5" />}
          </button>
        </div>

        {/* 전체 선택 / 해제 */}
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={enableAll} className="text-xs h-8 px-2.5">
            <RefreshCw className="h-3 w-3 mr-1" /> {t("practice3.allOn")}
          </Button>
          <Button variant="ghost" size="sm" onClick={disableAll} className="text-xs h-8 px-2.5 text-slate-500">
            {t("practice3.allOff")}
          </Button>
        </div>
      </div>

      {/* 3. 2x2 반응형 실시간 위젯 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* [SSE] 실시간 CPU 사용률 차트 */}
        <CpuWidget enabled={selectedWidgets.cpu} />

        {/* [SSE] 실시간 JVM 힙 메모리 차트 */}
        <MemoryWidget enabled={selectedWidgets.memory} />

        {/* [SSE] 실시간 스레드 현황 */}
        <ThreadWidget enabled={selectedWidgets.threads} />

        {/* [WebSocket] 컴포넌트 헬스 & 양방향 핑/진단 콘솔 */}
        <HealthWidget enabled={selectedWidgets.health} />
      </div>
    </div>
  );
}
