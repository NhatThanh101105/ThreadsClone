import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/lib/i18n";
import { Languages } from "lucide-react";

export default function LanguageToggle({ className = "" }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "vi";

  const handleToggle = () => {
    const nextLang = currentLang === "vi" ? "en" : "vi";
    changeLanguage(nextLang);
  };

  return (
    <button
      onClick={handleToggle}
      type="button"
      title={currentLang === "vi" ? "Chuyển sang English" : "Switch to Tiếng Việt"}
      aria-label="Toggle language"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-[var(--border)] transition-colors hover:bg-[var(--accent)] text-[var(--foreground)] cursor-pointer ${className}`}
    >
      <Languages size={15} />
      <span>{currentLang}</span>
    </button>
  );
}
