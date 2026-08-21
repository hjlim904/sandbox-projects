import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Code2, Server, ArrowRight, Sparkles, Bot } from "lucide-react";

function MainPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 상단 배너 */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-none space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Try it out</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            실습 프로젝트
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Java/Spring 백엔드를 바탕으로 React, TypeScript, tailwindcss를 활용한 실습 프로젝트입니다.
          </p>
        </div>
      </div>
      {/* 기술 스택 구성 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 프론트엔드 스택 */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <Code2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Frontend Architecture</CardTitle>
                <CardDescription>리액트 기반 프론트엔드 스택</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Framework</span>
              <span>React 19 + Vite</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Language</span>
              <span>TypeScript</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Styling & UI</span>
              <span>Tailwind CSS v4 + shadcn/ui</span>
            </div>
          </CardContent>
        </Card>
        {/* 백엔드 스택 (목표) */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <Server className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Backend Architecture (Target)</CardTitle>
                <CardDescription>Spring 기반</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Gateway</span>
              <span>Spring Cloud API Gateway</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Auth Server</span>
              <span>Spring Security + JWT Auth Backend</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Service API</span>
              <span>Spring Boot API Backend</span>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* 실습 페이지 바로가기 카트 3개 */}
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 pt-4">
        실습 목록
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">1. API 게시판 실습</CardTitle>
            <CardDescription>CRUD 및 API 데이터 연동 연습</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link to="/practice-1">
              <Button variant="outline" className="w-full justify-between mt-2">
                <span>실습 이동</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">2. 인증/권한 테스트</CardTitle>
            <CardDescription>JWT 기반 사용자 권한 확인</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link to="/practice-2">
              <Button variant="outline" className="w-full justify-between mt-2">
                <span>실습 이동</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">3. 백엔드 상태 대시보드</CardTitle>
            <CardDescription>WebSocket, SSE 실습</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link to="/practice-3">
              <Button variant="outline" className="w-full justify-between mt-2">
                <span>실습 이동</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
         <Card className="hover:shadow-md transition-shadow border-purple-200 dark:border-purple-900/50 bg-gradient-to-b from-purple-50/30 to-transparent dark:from-purple-950/20 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold text-xs mb-1">
              <Bot className="h-3.5 w-3.5" />
              <span>AI Ops Agent</span>
            </div>
            <CardTitle className="text-base font-bold">4. AI 에이전트 실습</CardTitle>
            <CardDescription className="text-xs">Gemini + Tool Function Calling</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link to="/practice-4">
              <Button size="sm" className="w-full justify-between bg-purple-600 hover:bg-purple-700 text-white">
                <span>실습 이동</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MainPage;