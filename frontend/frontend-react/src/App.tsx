import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/context/AuthContext";
import LoginPage from "./components/pages/LoginPage";
import { MainLayout } from "./components/layout/MainLayout";
import MainPage from "./components/pages/MainPage";


// 로그인하지 않은 사용자를 /login 으로 튕겨내는 보호용 컴포넌트 (Protected Route)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
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
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
