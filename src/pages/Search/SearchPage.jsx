import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

export default function SearchPage() {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-3.5 text-[var(--muted-foreground)]" size={18} />
        <input
          type="text"
          placeholder={t("nav.search") + "..."}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--muted)] border border-transparent text-sm focus:outline-none focus:border-[var(--border)]"
        />
      </div>
      <div className="text-center py-12 text-sm text-[var(--muted-foreground)]">
        {t("nav.search")}
      </div>
    </div>
  );
}
