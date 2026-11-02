import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Loader2, MailCheck, ArrowRight } from "lucide-react";
import Alert from "@/components/ui/Alert";
import authService from "@/services/authService";

export default function VerifyEmail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get("token");

  const [inputToken, setInputToken] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(urlToken));
  const [errorMessage, setErrorMessage] = useState(null);

  // Helper to extract token if user pastes either the pure token or the full URL
  const extractToken = (raw) => {
    if (!raw) return "";
    const trimmed = raw.trim();
    if (trimmed.includes("token=")) {
      try {
        const parsed = new URL(trimmed);
        return parsed.searchParams.get("token") || trimmed;
      } catch {
        const match = trimmed.match(/token=([a-zA-Z0-9_-]+)/);
        return match ? match[1] : trimmed;
      }
    }
    return trimmed;
  };

  const executeVerification = (tokenToVerify) => {
    const cleanToken = extractToken(tokenToVerify);
    if (!cleanToken) {
      setErrorMessage("Vui lòng nhập mã token hoặc đường dẫn xác thực từ email.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    authService
      .verifyEmail(cleanToken)
      .then(() => {
        // On successful verification, redirect to /login with state { verified: true }
        navigate("/login", { state: { verified: true }, replace: true });
      })
      .catch((err) => {
        setIsLoading(false);
        const msg =
          err.response?.data?.message ||
          t("auth.linkInvalidOrExpired") ||
          "Liên kết xác minh không hợp lệ hoặc đã hết hạn.";
        setErrorMessage(msg);
      });
  };

  useEffect(() => {
    if (urlToken) {
      executeVerification(urlToken);
    }
  }, [urlToken]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    executeVerification(inputToken);
  };

  return (
    <div className="w-full">
      <div className="w-full p-6 sm:p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto mb-4">
          <MailCheck size={26} />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-[var(--foreground)]">
          {t("auth.verifyEmailTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-6">
          Xác minh tài khoản để bắt đầu kết nối trên Threads.
        </p>

        {/* Loading state: Spinner + "Đang xác minh..." */}
        {isLoading && (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <Loader2 size={36} className="animate-spin text-[var(--foreground)] opacity-80" />
            <p className="text-base font-semibold text-[var(--foreground)]">
              {t("auth.verifying")}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] max-w-xs">
              {t("auth.verifyingDesc")}
            </p>
          </div>
        )}

        {/* Manual Token / Link Input Form when not auto-loading */}
        {!isLoading && (
          <div className="space-y-5 text-left">
            {errorMessage && (
              <Alert variant="error">
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <label className="block text-xs font-semibold text-[var(--foreground)]">
                Dán đường link hoặc mã token từ email:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="Ví dụ: http://localhost:5173/verify-email?token=... hoặc mã token"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-hidden focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <button
                type="submit"
                disabled={!inputToken.trim()}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
              >
                <span>Xác minh ngay</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="pt-3 border-t border-[var(--border)] text-center">
              <Link
                to="/login"
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-semibold transition-colors"
              >
                {t("auth.goToLogin")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

