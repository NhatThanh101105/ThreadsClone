import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import { useDebounce } from "@/hooks/useDebounce";
import { getRegisterSchema } from "@/lib/validations/auth";
import authService from "@/services/authService";

export default function Register() {
  const { t } = useTranslation();

  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // react-hook-form with Zod schema
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(getRegisterSchema(t)),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const usernameValue = watch("username");
  const emailValue = watch("email");

  const debouncedUsername = useDebounce(usernameValue, 700);
  const debouncedEmail = useDebounce(emailValue, 700);

  // Live status states: "idle" | "checking" | "valid" | "unavailable"
  const [usernameCheck, setUsernameCheck] = useState("idle");
  const [emailCheck, setEmailCheck] = useState("idle");

  // Debounced API check for username
  useEffect(() => {
    if (!usernameValue || usernameValue.length < 3) {
      setUsernameCheck("idle");
      return;
    }
    setUsernameCheck("checking");
  }, [usernameValue]);

  useEffect(() => {
    if (!debouncedUsername || debouncedUsername.length < 3) {
      setUsernameCheck("idle");
      return;
    }

    let isMounted = true;
    authService
      .validateUsername(debouncedUsername)
      .then(() => {
        if (isMounted) {
          setUsernameCheck("valid");
          clearErrors("username");
        }
      })
      .catch((err) => {
        if (isMounted) {
          setUsernameCheck("unavailable");
          const msg =
            err.response?.data?.message ||
            err.response?.data?.errors?.username?.[0] ||
            t("validation.unavailable");
          setError("username", { type: "server", message: msg });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedUsername, clearErrors, setError, t]);

  // Debounced API check for email
  useEffect(() => {
    if (!emailValue) {
      setEmailCheck("idle");
      return;
    }
    setEmailCheck("checking");
  }, [emailValue]);

  useEffect(() => {
    if (!debouncedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail)) {
      setEmailCheck("idle");
      return;
    }

    let isMounted = true;
    authService
      .validateEmail(debouncedEmail)
      .then(() => {
        if (isMounted) {
          setEmailCheck("valid");
          clearErrors("email");
        }
      })
      .catch((err) => {
        if (isMounted) {
          setEmailCheck("unavailable");
          const msg =
            err.response?.data?.message ||
            err.response?.data?.errors?.email?.[0] ||
            t("validation.unavailable");
          setError("email", { type: "server", message: msg });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedEmail, clearErrors, setError, t]);

  const onSubmit = async (data) => {
    setApiError(null);
    setSuccessMessage(null);

    try {
      await authService.register(data);
      // Registration successful: show specified success message
      setSuccessMessage(t("auth.registerSuccess"));
      reset();
      setUsernameCheck("idle");
      setEmailCheck("idle");
    } catch (error) {
      const resp = error.response?.data;
      if (resp?.errors) {
        // Set field-specific validation errors from backend
        Object.entries(resp.errors).forEach(([field, msgs]) => {
          setError(field, {
            type: "server",
            message: Array.isArray(msgs) ? msgs[0] : msgs,
          });
        });
      }
      setApiError(
        resp?.message || resp?.error || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin."
      );
    }
  };

  return (
    <div className="w-full">
      <div className="w-full p-6 sm:p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {/* Header Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6 text-[var(--foreground)]">
          {t("auth.registerTitle")}
        </h1>

        {/* Success Alert between title and first input */}
        {successMessage && (
          <div className="mb-5">
            <Alert variant="success" onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          </div>
        )}

        {/* General Error Alert */}
        {apiError && (
          <div className="mb-5">
            <Alert variant="error" onClose={() => setApiError(null)}>
              {apiError}
            </Alert>
          </div>
        )}

        {/* Registration Form with react-hook-form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Tên hiển thị (username) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]"
              >
                {t("auth.username")} <span className="text-rose-500">*</span>
              </label>

              {/* Debounce checking status badge */}
              {usernameCheck === "checking" && (
                <span className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)] animate-pulse">
                  <Loader2 size={12} className="animate-spin" />
                  {t("validation.checking")}
                </span>
              )}
              {usernameCheck === "valid" && !errors.username && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 size={12} />
                  {t("validation.available")}
                </span>
              )}
            </div>

            <input
              id="username"
              type="text"
              disabled={isSubmitting}
              {...register("username")}
              placeholder="dungvq2"
              className={`w-full px-4 py-3 rounded-xl bg-[var(--muted)] border text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none transition-colors disabled:opacity-50 ${
                errors.username
                  ? "border-rose-500 focus:border-rose-500"
                  : usernameCheck === "valid"
                  ? "border-emerald-500 focus:border-emerald-500"
                  : "border-[var(--border)] focus:border-[var(--primary)]"
              }`}
            />
            {errors.username && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 animate-in fade-in">
                <AlertCircle size={13} className="shrink-0" />
                <span>{errors.username.message}</span>
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]"
              >
                {t("auth.email")} <span className="text-rose-500">*</span>
              </label>

              {/* Debounce checking status badge */}
              {emailCheck === "checking" && (
                <span className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)] animate-pulse">
                  <Loader2 size={12} className="animate-spin" />
                  {t("validation.checking")}
                </span>
              )}
              {emailCheck === "valid" && !errors.email && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 size={12} />
                  {t("validation.available")}
                </span>
              )}
            </div>

            <input
              id="email"
              type="email"
              disabled={isSubmitting}
              {...register("email")}
              placeholder="name@example.com"
              className={`w-full px-4 py-3 rounded-xl bg-[var(--muted)] border text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none transition-colors disabled:opacity-50 ${
                errors.email
                  ? "border-rose-500 focus:border-rose-500"
                  : emailCheck === "valid"
                  ? "border-emerald-500 focus:border-emerald-500"
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

          {/* Mật khẩu */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5"
            >
              {t("auth.password")} <span className="text-rose-500">*</span>
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

          {/* Xác nhận mật khẩu */}
          <div>
            <label
              htmlFor="password_confirmation"
              className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5"
            >
              {t("auth.confirmPassword")} <span className="text-rose-500">*</span>
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

          {/* Submit Button */}
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
              <span>{t("auth.registerBtn")}</span>
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
