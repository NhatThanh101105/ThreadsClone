import { useState } from "react";
import { useTranslation } from "react-i18next";
import copy from "copy-to-clipboard";
import { toast } from "sonner";
import { Copy, Check, X, Code } from "lucide-react";

export default function EmbedModal({ isOpen, onClose, post }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !post) return null;

  const username = post.user?.username || post.user?.name || "user";
  const postId = post.id;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const embedUrl = `${origin}/@${username}/post/${postId}/embed`;

  const embedCode = `<iframe src="${embedUrl}" width="100%" height="450" frameborder="0" scrolling="no" allowtransparency="true" style="max-width: 540px; border-radius: 16px; border: 1px solid rgba(128,128,128,0.2);"></iframe>`;

  const handleCopyCode = () => {
    copy(embedCode);
    setCopied(true);
    toast.success(t("modal.codeCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-2xl relative animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2">
            <Code size={18} className="text-[var(--primary)]" />
            <h3 className="font-bold text-sm text-[var(--foreground)]">
              {t("modal.embedTitle")}
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label={t("common.close")}
            className="p-1 rounded-full hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[var(--muted-foreground)] mb-4">
          {t("modal.embedDesc")}
        </p>

        {/* Live Iframe Preview */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-2 mb-4 overflow-hidden">
          <div className="text-[11px] text-[var(--muted-foreground)] px-2 py-1 border-b border-[var(--border)] mb-2">
            Bản xem trước trực tiếp:
          </div>
          <iframe
            src={embedUrl}
            title="Post embed preview"
            className="w-full h-64 rounded-lg border-0 bg-transparent"
            scrolling="no"
          />
        </div>

        {/* Code Snippet Box */}
        <div className="relative mb-4">
          <textarea
            readOnly
            rows={3}
            value={embedCode}
            className="w-full font-mono text-xs p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] select-all focus:outline-none resize-none"
          />
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleCopyCode}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity cursor-pointer"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? t("modal.codeCopied") : t("modal.copyCode")}</span>
        </button>
      </div>
    </div>
  );
}
