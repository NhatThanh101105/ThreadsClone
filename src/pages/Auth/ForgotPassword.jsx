import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import { getForgotPasswordSchema } from "@/lib/validations/auth";
import authService from "@/services/authService";

export default function ForgotPassword() {
  const { t } = useTranslation();

  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(getForgotPasswordSchema(t)),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    setApiError(null);
    setSuccessMessage(null);

    try {
      await authService.forgotPassword(data.email);
      setSuccessMessage(t("auth.resetSent"));
      reset();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Gửi yêu cầu đặt lại mật khẩu thất bại. Vui lòng thử lại.";
      setApiError(msg);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full p-6 sm:p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {/* Header Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-2 text-[var(--foreground)]">
          {t("auth.forgotPasswordTitle")}
        </h1>
        <p className="text-sm text-center text-[var(--muted-foreground)] mb-6">
          {t("auth.forgotPasswordDesc")}
        </p>

        {/* Success Info Alert */}
        {successMessage && (
          <div className="mb-5">
            <Alert variant="info" onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          </div>
        )}

        {/* Error Alert */}
        {apiError && (
          <div className="mb-5">
            <Alert variant="error" onClose={() => setApiError(null)}>
              {apiError}
            </Alert>
          </div>
        )}

        {/* Form with react-hook-form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
              className={`w-full px-4 py-3 rounded-xl bg-[var(--muted)] border text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none transition-colors disabled:opacity-50 ${
                errors.email
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-[var(--border)] focus:border-[var(--primary)]"
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 animate-in fade-in">
                <AlertCircle size={13} className="shrink-0" />
                <span>{errors.email.message}</span>
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
              <span>{t("auth.sendResetLink")}</span>
            )}
          </button>
        </form>

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
