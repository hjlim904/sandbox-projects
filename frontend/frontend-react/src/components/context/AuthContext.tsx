import { jwtDecode } from "jwt-decode";
import React, { createContext, useCallback, useContext, useState } from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    user: string | null;
    name: string | null;
    token: string | null;
    checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface JwtPayload {
    exp: number;
}

const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

//export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//export const AuthProvider = ({children}: {children: React.ReactNode}) => {
export function AuthProvider({ children }: { children: React.ReactNode }) {
    // 기본값으로 false (비로그인 상태)
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
        //return localStorage.getItem("isLoggedIn") === "true";
        // const savedToken = localStorage.getItem("token");
        // if (!savedToken) return false;
        // try {
        //     const decoded = jwtDecode<JwtPayload>(savedToken);
        //     if (decoded.exp * 1000 < Date.now()) {
        //         localStorage.removeItem("token");
        //         localStorage.removeItem("user");
        //         localStorage.removeItem("name");
        //         localStorage.removeItem("isLoggedIn");
        //         return false;
        //     }
        //     return true;
        // } catch {
        //     localStorage.removeItem("token");
        //     localStorage.removeItem("user");
        //     localStorage.removeItem("name");
        //     localStorage.removeItem("isLoggedIn");
        //     return false;
        // }
        return isTokenValid(localStorage.getItem("token"));
    });
    const [user, setUser] = useState<string | null>(() => {
        return localStorage.getItem("user");
    });
    const [name, setName] = useState<string | null>(() => {
        return localStorage.getItem("name");
    });
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("token");
    });

    // const login = (username: string) => {
    //     setIsLoggedIn(true);
    //     setUser(username);
    //     localStorage.setItem("isLoggedIn", "true");
    //     localStorage.setItem("user", username);
    // };

    const login = async (username: string, password: string) => {
        const response = await fetch("http://localhost:8081/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "로그인 실패");
        }

        const data: { token: string; username: string; name: string } = await response.json();

        setIsLoggedIn(true);
        setUser(data.username);
        setName(data.name);
        setToken(data.token);

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", data.username);
        localStorage.setItem("name", data.name);
        localStorage.setItem("token", data.token);
    };

    const logout = useCallback(() => {
        setIsLoggedIn(false);
        setUser(null);
        setName(null);
        setToken(null);
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
        localStorage.removeItem("name");
        localStorage.removeItem("token");
    },[]);

    // useEffect(() => {
    //     if (token) {
    //         try {
    //             const decoded = jwtDecode<JwtPayload>(token);
    //             if (decoded.exp * 1000 < Date.now()) {
    //                 logout();

    //             }
    //         } catch {
    //             logout();
    //         }
    //     }
    // }, [token]);
    const checkAuth = useCallback(():boolean =>{
        const currentToken = localStorage.getItem("token");
        if(!isTokenValid(currentToken)){
            logout();
            return false;
        }
        return true;
    },[logout]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, user, name, token, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth는 AuthProvider 내부에서만 사용가능");
    }
    return context;
};