import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className = "",
}) {
  const variantStyles = {
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    error: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  };

  const icons = {
    info: <Info className="shrink-0" size={18} />,
    success: <CheckCircle2 className="shrink-0" size={18} />,
    error: <AlertCircle className="shrink-0" size={18} />,
    warning: <AlertCircle className="shrink-0" size={18} />,
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-xl border text-sm transition-all animate-in fade-in",
        variantStyles[variant] || variantStyles.info,
        className
      )}
    >
      <span className="mt-0.5">{icons[variant] || icons.info}</span>
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5 leading-tight">{title}</p>}
        <div className="text-xs sm:text-sm leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Close alert"
          className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
