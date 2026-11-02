import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={t("common.switchTheme")}
      aria-label={t("common.switchTheme")}
      className={`p-2.5 rounded-full transition-colors hover:bg-[var(--accent)] text-[var(--foreground)] cursor-pointer ${className}`}
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
