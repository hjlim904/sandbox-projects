import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language?.startsWith("en");

  const handleCheckedChange = (checked: boolean) => {
    i18n.changeLanguage(checked ? "en" : "ko");
  };

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 select-none shadow-sm">
      {/* 1. 왼쪽에 배치된 지구본 아이콘 */}
      <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400" />

      {/* 2. KR 라벨 (클릭 시 한국어로 전환) */}
      <span
        onClick={() => i18n.changeLanguage("ko")}
        className={`text-xs cursor-pointer transition-colors ${
          !isEnglish
            ? "font-bold text-blue-600 dark:text-blue-400"
            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        }`}
      >
        KR
      </span>

      {/* 3. 동그라미가 좌/우로 이동하는 스위치 */}
      <Switch
        checked={isEnglish}
        onCheckedChange={handleCheckedChange}
        className="scale-75 data-[state=checked]:bg-blue-600"
        aria-label="Toggle language between Korean and English"
      />

      {/* 4. EN 라벨 (클릭 시 영어로 전환) */}
      <span
        onClick={() => i18n.changeLanguage("en")}
        className={`text-xs cursor-pointer transition-colors ${
          isEnglish
            ? "font-bold text-blue-600 dark:text-blue-400"
            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        }`}
      >
        EN
      </span>
    </div>
  );
}
