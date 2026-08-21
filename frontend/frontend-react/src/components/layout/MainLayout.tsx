import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Code2, Database, Layers, LayoutDashboard, LogOut, Menu, User, Bot } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";

export function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // 데스크톱 사이드바 접힘/열림 상태
  const [isCollapsed, setIsCollapsed] = useState(false);
  // 모바일 사이드바 열림/닫힘 상태
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  // 사이드바에 들어갈 3개의 실습 메뉴 항목들
  const navItems = [
    { name: "메인 소개", path: "/", icon: LayoutDashboard },
    { name: "실습 1: API 게시판", path: "/practice-1", icon: Code2 },
    { name: "실습 2: 인증/권한 테스트", path: "/practice-2", icon: Database },
    { name: "실습 3: 백엔드 상태 대시보드", path: "/practice-3", icon: Layers },
    { name: "실습 4: AI 에이전트", path: "/practice-4", icon: Bot },
  ];
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* 헤더 (Header) */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* 햄버거 메뉴 버튼 */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger render={(props) => (
              <Button {...props} variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>)} />
            <SheetContent side="left" className="w-64 p-4">
              <div className="font-bold text-lg mb-6">포트폴리오 메뉴</div>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Java Dev Portfolio
          </span>
        </div>
        {/* 오른쪽 사용자 프로필 & 로그아웃 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
              <User className="h-4 w-4" />
            </div>
            <span>{user || "사용자"}님</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">로그아웃</span>
          </Button>
        </div>
      </header>
      <div className="flex-1 flex">
        {/* 데스크톱용 접이식 사이드바 (Collapsible Sidebar) */}
        <aside
          className={`hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300 relative ${isCollapsed ? "w-16" : "w-64"
            }`}
        >
          {/* 사이드바 토글 버튼 */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 z-10"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
          <div className="p-4 flex-1">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isCollapsed ? "justify-center px-0" : ""
                      }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-slate-600 dark:text-slate-400" />
                    {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        {/* 메인 페이지 콘텐츠 영역 */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Outlet: 현재 경로에 매칭된 페이지(MainPage, Practice1Page 등)가 표시되는 위치 */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}