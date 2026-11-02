import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-[var(--muted-foreground)] mb-6">Page not found</p>
      <Link
        to="/"
        className="px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--primary)] text-[var(--primary-foreground)]"
      >
        {t("common.back")} {t("nav.home")}
      </Link>
    </div>
  );
}
