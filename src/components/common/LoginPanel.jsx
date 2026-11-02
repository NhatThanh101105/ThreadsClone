import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { LogIn } from "lucide-react";

export default function LoginPanel() {
  const { t } = useTranslation();

  return (
    <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
      <h3 className="text-base font-bold text-[var(--foreground)] mb-1">
        {t("home.loginToSeeMore")}
      </h3>
      <p className="text-xs text-[var(--muted-foreground)] mb-4">
        {t("home.loginPrompt")}
      </p>
      <Link
        to="/login"
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
      >
        <LogIn size={16} />
        <span>{t("nav.login")}</span>
      </Link>
    </div>
  );
}
