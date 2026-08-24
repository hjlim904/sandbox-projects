import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, ShieldAlert, ShieldCheck, Globe, User, Terminal, RefreshCw } from "lucide-react";

interface ApiResponse {
  endpoint: string;
  status: number | string;
  ok: boolean;
  data: any;
  timestamp: string;
}

export default function Practice2Page() {
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

      const res = await fetch(`http://localhost:8082${endpoint}`, {
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
    <div className="space-y-6">
      {/* 1. 상단 안내 및 현재 로그인 유저 정보 카드 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                실습 2
              </span>
              <h1 className="text-xl font-bold text-slate-100">JWT RBAC & Reactive Security 권한 제어</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              현재 로그인된 계정의 권한에 따라 비동기 리소스 서버의 200 OK / 403 Forbidden 응답을 실시간으로 확인해보세요.
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
                  {user === "admin" ? "ROLE_ADMIN (관리자)" : "ROLE_USER (일반유저)"}
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
            <h3 className="font-semibold text-slate-200 text-sm">🌐 1. Public API</h3>
            <p className="text-xs text-slate-400 mt-1">누구나 접근 가능한 공개 엔드포인트</p>
            <code className="block mt-2 text-[11px] bg-slate-950 px-2 py-1 rounded text-slate-300 font-mono">
              GET /api/security/public
            </code>
          </div>
          <button
            onClick={() => callApi("/api/security/public", false)}
            disabled={loadingEndpoint !== null}
            className="mt-4 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            {loadingEndpoint === "/api/security/public" ? "호출 중..." : "공개 API 호출 (No Token)"}
          </button>
        </div>

        {/* User Only API */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">👤 2. User Only API</h3>
            <p className="text-xs text-slate-400 mt-1">ROLE_USER 이상 접근 허용</p>
            <code className="block mt-2 text-[11px] bg-slate-950 px-2 py-1 rounded text-slate-300 font-mono">
              GET /api/security/user-only
            </code>
          </div>
          <button
            onClick={() => callApi("/api/security/user-only")}
            disabled={loadingEndpoint !== null}
            className="mt-4 w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            {loadingEndpoint === "/api/security/user-only" ? "호출 중..." : "일반 유저 API 호출"}
          </button>
        </div>

        {/* Admin Only API */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">🛡️ 3. Admin Only API</h3>
            <p className="text-xs text-slate-400 mt-1">ROLE_ADMIN 만 접근 가능 (user1은 403)</p>
            <code className="block mt-2 text-[11px] bg-slate-950 px-2 py-1 rounded text-slate-300 font-mono">
              GET /api/security/admin-only
            </code>
          </div>
          <button
            onClick={() => callApi("/api/security/admin-only")}
            disabled={loadingEndpoint !== null}
            className="mt-4 w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            {loadingEndpoint === "/api/security/admin-only" ? "호출 중..." : "관리자 전용 API 호출"}
          </button>
        </div>

        {/* My Info API */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200 text-sm">🆔 4. My Info API</h3>
            <p className="text-xs text-slate-400 mt-1">현재 SecurityContext 인증 정보 확인</p>
            <code className="block mt-2 text-[11px] bg-slate-950 px-2 py-1 rounded text-slate-300 font-mono">
              GET /api/security/me
            </code>
          </div>
          <button
            onClick={() => callApi("/api/security/me")}
            disabled={loadingEndpoint !== null}
            className="mt-4 w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            {loadingEndpoint === "/api/security/me" ? "호출 중..." : "인증 정보 조회"}
          </button>
        </div>
      </div>

      {/* 3. 실시간 응답 터미널 로그 */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono font-semibold text-slate-300">Security Response Terminal</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {logs.length} events
            </span>
          </div>
          <button
            onClick={clearLogs}
            className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            로그 지우기
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-96 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-slate-500 text-center py-8">
              위 버튼을 클릭하여 API를 호출하면 실시간 HTTP 상태 코드 및 응답이 이곳에 출력됩니다.
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
