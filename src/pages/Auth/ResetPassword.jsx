import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import { getResetPasswordSchema } from "@/lib/validations/auth";
import authService from "@/services/authService";

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const emailFromUrl = searchParams.get("email") || "";

  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validate reset token on mount
  useEffect(() => {
    if (!token) {
      setIsCheckingToken(false);
      setIsTokenValid(false);
      return;
    }

    let isMounted = true;
    authService
      .validateResetToken(token)
      .then((res) => {
        if (isMounted) {
          // Check server response: { success: true, data: { valid: true/false } }
          const isValid = res?.data?.valid ?? res?.valid ?? false;
          setIsTokenValid(Boolean(isValid));
          setIsCheckingToken(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsTokenValid(false);
          setIsCheckingToken(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(getResetPasswordSchema(t)),
    mode: "onChange",
    defaultValues: {
      email: emailFromUrl,
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      await authService.resetPassword({
        token,
        email: data.email || emailFromUrl,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      // Navigate to /login with success route state
      navigate("/login", {
        state: { message: t("auth.resetSuccess") },
        replace: true,
      });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Đặt lại mật khẩu thất bại. Vui lòng thử lại.";
      setApiError(msg);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="w-full p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-[var(--muted-foreground)]" />
        <p className="text-sm text-[var(--muted-foreground)]">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full p-6 sm:p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6 text-[var(--foreground)]">
          {t("auth.resetPasswordTitle")}
        </h1>

        {/* Invalid or Expired Token View */}
        {!isTokenValid ? (
          <div className="space-y-6 text-center">
            <Alert variant="error">
              {t("auth.linkInvalidOrExpired")}
            </Alert>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center py-3 px-4 rounded-xl font-semibold text-sm bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
            >
              {t("auth.goToLogin")}
            </Link>
          </div>
        ) : (
          <>
            {/* Error Alert */}
            {apiError && (
              <div className="mb-5">
                <Alert variant="error" onClose={() => setApiError(null)}>
                  {apiError}
                </Alert>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Optional Email field if not provided in URL */}
              {!emailFromUrl && (
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5"
                  >
                    {t("auth.email")} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    disabled={isSubmitting}
                    {...register("email")}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none transition-colors"
                  />
                </div>
              )}

              {/* Mật khẩu mới */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5"
                >
                  {t("auth.newPassword")} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    disabled={isSubmitting}
                    {...register("password")}
                    placeholder="••••••••"
                    className={`w-full pl-4 pr-11 py-3 rounded-xl bg-[var(--muted)] border text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none transition-colors disabled:opacity-50 ${
                      errors.password
                        ? "border-rose-500 focus:border-rose-500"
                        : "border-[var(--border)] focus:border-[var(--primary)]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div>
                <label
                  htmlFor="password_confirmation"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5"
                >
                  {t("auth.confirmNewPassword")} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    disabled={isSubmitting}
                    {...register("password_confirmation")}
                    placeholder="••••••••"
                    className={`w-full pl-4 pr-11 py-3 rounded-xl bg-[var(--muted)] border text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none transition-colors disabled:opacity-50 ${
                      errors.password_confirmation
                        ? "border-rose-500 focus:border-rose-500"
                        : "border-[var(--border)] focus:border-[var(--primary)]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{errors.password_confirmation.message}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{t("common.loading")}</span>
                  </>
                ) : (
                  <span>{t("auth.saveNewPassword")}</span>
                )}
              </button>
            </form>
          </>
        )}

        {/* Link to Login */}
        <div className="text-center text-sm pt-6 mt-6 border-t border-[var(--border)]">
          <Link
            to="/login"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium transition-colors"
          >
            {t("auth.haveAccount")}
          </Link>
        </div>
      </div>
    </div>
  );
}
