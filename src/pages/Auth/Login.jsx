import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import { getLoginSchema } from "@/lib/validations/auth";
import { loginUser } from "@/store/slices/authSlice";

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Check route state (e.g., from VerifyEmail or ResetPassword)
  const routeState = location.state || {};
  const [routeNotice, setRouteNotice] = useState(
    routeState.verified
      ? t("auth.verifiedSuccess")
      : routeState.message || null
  );

  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // react-hook-form with Zod schema
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(getLoginSchema(t)),
    mode: "onChange",
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      await dispatch(loginUser(data)).unwrap();
      // On success, redirect to intended target or home
      const destination = routeState.from?.pathname || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      setApiError(typeof err === "string" ? err : t("auth.errorOccurred"));
    }
  };

  return (
    <div className="w-full">
      <div className="w-full p-6 sm:p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {/* Header Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6 text-[var(--foreground)]">
          {t("auth.loginTitle")}
        </h1>

        {/* Route state success message (from verify-email or reset-password) */}
        {routeNotice && (
          <div className="mb-5">
            <Alert variant="success" onClose={() => setRouteNotice(null)}>
              {routeNotice}
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

        {/* Login Form with react-hook-form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email hoặc tên người dùng */}
          <div>
            <label
              htmlFor="login"
              className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5"
            >
              {t("auth.loginInput")} <span className="text-rose-500">*</span>
            </label>
            <input
              id="login"
              type="text"
              disabled={isSubmitting}
              {...register("login")}
              placeholder="name@example.com hoặc username"
              className={`w-full px-4 py-3 rounded-xl bg-[var(--muted)] border text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none transition-colors disabled:opacity-50 ${
                errors.login
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-[var(--border)] focus:border-[var(--primary)]"
              }`}
            />
            {errors.login && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 animate-in fade-in">
                <AlertCircle size={13} className="shrink-0" />
                <span>{errors.login.message}</span>
              </p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]"
              >
                {t("auth.password")} <span className="text-rose-500">*</span>
              </label>
            </div>
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

            {/* Quên mật khẩu? link dưới input password */}
            <div className="text-right mt-2">
              <Link
                to="/forgot-password"
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {t("auth.forgotPasswordLink")}
              </Link>
            </div>
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
              <span>{t("auth.loginBtn")}</span>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="text-center text-sm pt-6 mt-6 border-t border-[var(--border)]">
          <Link
            to="/register"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium transition-colors"
          >
            {t("auth.noAccount")}
          </Link>
        </div>
      </div>
    </div>
  );
}
