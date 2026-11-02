import { useTranslation } from "react-i18next";
import { AlertTriangle, X } from "lucide-react";

export default function BlockConfirmModal({ isOpen, onClose, onConfirm, username }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-xl relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          type="button"
          aria-label={t("common.close")}
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 mx-auto">
          <AlertTriangle size={24} />
        </div>

        <h3 className="text-base font-bold text-center text-[var(--foreground)] mb-2">
          {t("modal.blockTitle")} @{username}
        </h3>
        <p className="text-xs text-center text-[var(--muted-foreground)] mb-6">
          {t("modal.blockDesc")}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs border border-[var(--border)] hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer"
          >
            {t("post.block")}
          </button>
        </div>
      </div>
    </div>
  );
}
