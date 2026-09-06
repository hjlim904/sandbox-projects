import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, ShieldAlert, ShieldCheck, Globe, User, Terminal, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ApiResponse {
  endpoint: string;
  status: number | string;
  ok: boolean;
  data: any;
  timestamp: string;
}

export default function Practice2Page() {
  const { t } = useTranslation();
  const { user, name, token } = useAuth();
  const [logs, setLogs] = useState<ApiResponse[]>([]);
  const [loadingEndpoint, setLoadingEndpoint] = useState<string | null>(null);

  const callApi = async (endpoint: string, requiresToken: boolean = true) => {
    setLoadingEndpoint(endpoint);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (requiresToken && token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`http://localhost:8080${endpoint}`, {
        method: "GET",
        headers,
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = { message: res.statusText };
      }

      const newLog: ApiResponse = {
        endpoint,
        status: res.status,
        ok: res.ok,
        data,
        timestamp: new Date().toLocaleTimeString(),
      };

      setLogs((prev) => [newLog, ...prev]);
    } catch (err: any) {
      setLogs((prev) => [
        {
          endpoint,
          status: "ERR",
          ok: false,
          data: { error: err.message || "Network Error" },
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } finally {
      setLoadingEndpoint(null);
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* 1. 상단 안내 헤더 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold border border-indigo-500/20">
              <Shield className="h-3.5 w-3.5" />
              <span>{t("practice2.badge")}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              {t("practice2.title")}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              {t("practice2.desc")}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/80 px-4 py-2.5 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-200">{name || "사용자"}</span>
                <span className="text-xs text-slate-500">(@{user})</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${user === "admin" ? "bg-amber-400" : "bg-blue-400"}`} />
                <span className="text-xs font-medium text-slate-400">
                  {user === "admin" ? "ROLE_ADMIN" : "ROLE_USER"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. API 호출 테스트 패널 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Public API */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">{t("practice2.publicApi")}</h3>
            <p className="text-xs text-slate-400 mt-1">{t("practice2.publicApiDesc")}</p>
            <code className="block mt-2 text-[11px] bg-slate-950 px-2 py-1 rounded text-slate-300 font-mono">
              GET /api/security/public
            </code>
          </div>
          <button
            onClick={() => callApi("/api/security/public", false)}
            disabled={loadingEndpoint !== null}
            className="mt-4 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            {loadingEndpoint === "/api/security/public" ? t("practice2.calling") : t("practice2.callBtn")}
          </button>
        </div>

        {/* User Only API */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">{t("practice2.userApi")}</h3>
            <p className="text-xs text-slate-400 mt-1">{t("practice2.userApiDesc")}</p>
            <code className="block mt-2 text-[11px] bg-slate-950 px-2 py-1 rounded text-slate-300 font-mono">
              GET /api/security/user-only
            </code>
          </div>
          <button
            onClick={() => callApi("/api/security/user-only")}
            disabled={loadingEndpoint !== null}
            className="mt-4 w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            {loadingEndpoint === "/api/security/user-only" ? t("practice2.calling") : t("practice2.callBtn")}
          </button>
        </div>

        {/* Admin Only API */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">{t("practice2.adminApi")}</h3>
            <p className="text-xs text-slate-400 mt-1">{t("practice2.adminApiDesc")}</p>
            <code className="block mt-2 text-[11px] bg-slate-950 px-2 py-1 rounded text-slate-300 font-mono">
              GET /api/security/admin-only
            </code>
          </div>
          <button
            onClick={() => callApi("/api/security/admin-only")}
            disabled={loadingEndpoint !== null}
            className="mt-4 w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            {loadingEndpoint === "/api/security/admin-only" ? t("practice2.calling") : t("practice2.callBtn")}
          </button>
        </div>

        {/* My Info API */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">🆔 4. My Info API</h3>
            <p className="text-xs text-slate-400 mt-1">SecurityContext</p>
            <code className="block mt-2 text-[11px] bg-slate-950 px-2 py-1 rounded text-slate-300 font-mono">
              GET /api/security/me
            </code>
          </div>
          <button
            onClick={() => callApi("/api/security/me")}
            disabled={loadingEndpoint !== null}
            className="mt-4 w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            {loadingEndpoint === "/api/security/me" ? t("practice2.calling") : t("practice2.callBtn")}
          </button>
        </div>
      </div>

      {/* 3. 실시간 응답 터미널 로그 */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono font-semibold text-slate-300">{t("practice2.terminalTitle")}</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {logs.length} events
            </span>
          </div>
          <button
            onClick={clearLogs}
            className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            {t("practice2.clearLogs")}
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-96 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-slate-500 text-center py-8">
              {t("practice2.noLogs")}
            </div>
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${log.status === 200
                  ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                  : log.status === 403
                    ? "bg-amber-950/20 border-amber-800/40 text-amber-300"
                    : "bg-rose-950/20 border-rose-800/40 text-rose-300"
                  }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[11px] ${log.status === 200
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : log.status === 403
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                    >
                      HTTP {log.status}
                    </span>
                    <span className="text-slate-200 font-bold">{log.endpoint}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                </div>
                <pre className="text-[11px] text-slate-300 bg-slate-950/80 p-2.5 rounded border border-slate-800/50 overflow-x-auto">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
