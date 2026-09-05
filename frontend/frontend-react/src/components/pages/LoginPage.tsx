import React from "react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Lock, LogIn, User } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

function LoginPage() {
    const { t } = useTranslation();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.SubmitEvent) =>{
        e.preventDefault();

        if(!username.trim()){
            alert(t("login.usernameRequired"));
            return;
        }

        if(!password.trim()){
            alert(t("login.passwordRequired"));
            return;
        }

        try{
          setLoading(true);
          await login(username, password);
          navigate("/");
        }catch(err: any){
          alert(err.message || t("login.loginFailed"));
        } finally{
          setLoading(false);
        }
    };
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <Card className="w-full max-w-md shadow-lg border-slate-200 dark:border-slate-800">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <LogIn className="w-6 h-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">{t("login.title")}</CardTitle>
            <CardDescription>
              {t("login.welcome")}<br />
              {t("login.demoAccounts")}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("login.username")}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder={t("login.usernamePlaceholder")}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("login.password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder={t("login.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button type="submit" className="w-full text-base font-semibold" disabled={loading}>
                {loading ? t("login.submitting") : t("login.submit")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
}

export default LoginPage;