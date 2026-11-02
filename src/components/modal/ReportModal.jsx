import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Flag, X } from "lucide-react";

export default function ReportModal({ isOpen, onClose, onConfirm }) {
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState("spam");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const reasons = [
    { id: "spam", label: t("modal.reportReasons.spam") },
    { id: "harassment", label: t("modal.reportReasons.harassment") },
    { id: "hateSpeech", label: t("modal.reportReasons.hateSpeech") },
    { id: "violence", label: t("modal.reportReasons.violence") },
    { id: "inappropriate", label: t("modal.reportReasons.inappropriate") },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ reason: selectedReason, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-xl relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          type="button"
          aria-label={t("common.close")}
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-rose-500/10 text-rose-500">
            <Flag size={20} />
          </div>
          <h3 className="text-base font-bold text-[var(--foreground)]">
            {t("modal.reportTitle")}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
              {t("modal.reportReasonLabel")}
            </label>
            <div className="space-y-2">
              {reasons.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                    selectedReason === r.id
                      ? "border-[var(--primary)] bg-[var(--accent)] text-[var(--foreground)] font-medium"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r.id}
                    checked={selectedReason === r.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-[var(--primary)]"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="reportDesc"
              className="block text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5"
            >
              {t("modal.reportDescriptionLabel")}
            </label>
            <textarea
              id="reportDesc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("modal.reportPlaceholder")}
              className="w-full p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs border border-[var(--border)] hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors cursor-pointer"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer"
            >
              {t("post.report")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
