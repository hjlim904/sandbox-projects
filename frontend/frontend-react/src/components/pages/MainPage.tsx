import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Code2, Server, ArrowRight, Sparkles, Bot } from "lucide-react";
import { useTranslation } from "react-i18next";

function MainPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 상단 배너 */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-none space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("main.badge")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {t("main.title")}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t("main.desc")}
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
                <CardTitle>{t("main.frontendTitle")}</CardTitle>
                <CardDescription>{t("main.frontendDesc")}</CardDescription>
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
                <CardTitle>{t("main.backendTitle")}</CardTitle>
                <CardDescription>{t("main.backendDesc")}</CardDescription>
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
      {/* 실습 페이지 바로가기 카드들 */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 pt-4">
          {t("main.coursesTitle")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
          {t("main.coursesDesc")}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg">{t("nav.practice1")}</CardTitle>
            <CardDescription className="text-xs">{t("main.course1Desc")}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link to="/practice-1">
              <Button variant="outline" className="w-full justify-between mt-2">
                <span>{t("main.startPractice")}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg">{t("nav.practice2")}</CardTitle>
            <CardDescription className="text-xs">{t("main.course2Desc")}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link to="/practice-2">
              <Button variant="outline" className="w-full justify-between mt-2">
                <span>{t("main.startPractice")}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg">{t("nav.practice3")}</CardTitle>
            <CardDescription className="text-xs">{t("main.course3Desc")}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link to="/practice-3">
              <Button variant="outline" className="w-full justify-between mt-2">
                <span>{t("main.startPractice")}</span>
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
            <CardTitle className="text-base font-bold">{t("nav.practice4")}</CardTitle>
            <CardDescription className="text-xs">{t("main.course4Desc")}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link to="/practice-4">
              <Button size="sm" className="w-full justify-between bg-purple-600 hover:bg-purple-700 text-white">
                <span>{t("main.startPractice")}</span>
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