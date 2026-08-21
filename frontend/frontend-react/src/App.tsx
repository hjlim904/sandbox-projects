import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/context/AuthContext";
import LoginPage from "./components/pages/LoginPage";
import { MainLayout } from "./components/layout/MainLayout";
import MainPage from "./components/pages/MainPage";
import Practice3Page from "./components/pages/Practice3Page";
import { useEffect } from "react";
import Practice4Page from "./components/pages/Practice4Page";


// 로그인하지 않은 사용자를 /login 으로 튕겨내는 보호용 컴포넌트 (Protected Route)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, checkAuth } = useAuth();
  const location = useLocation();

  // useEffect(()=>{
  //   checkAuth();
  // },[location.pathname, checkAuth]);
  const isValid = checkAuth();

  if (!isLoggedIn || !isValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. 로그인 페이지 */}
          <Route path="/login" element={<LoginPage />} />
          {/* 2. 로그인해야 접근할 수 있는 메인 레이아웃 영역 */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* 메인 루트(/)일 때 MainPage 렌더링 */}
            <Route index element={<MainPage />} />
            <Route path="practice-3" element={<Practice3Page />} />
            <Route path="practice-4" element={<Practice4Page />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
