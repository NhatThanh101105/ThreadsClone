import { z } from "zod";

/**
 * Creates dynamic Zod schemas using i18n translation function `t`.
 */

export const getRegisterSchema = (t) =>
  z
    .object({
      username: z
        .string()
        .min(1, { message: t("validation.usernameRequired") })
        .min(3, { message: t("validation.usernameMin") })
        .max(30, { message: t("validation.usernameMin") })
        .regex(/^[a-zA-Z0-9_.]+$/, {
          message: t("validation.usernamePattern"),
        }),
      email: z
        .string()
        .min(1, { message: t("validation.emailRequired") })
        .email({ message: t("validation.emailInvalid") }),
      password: z
        .string()
        .min(1, { message: t("validation.passwordRequired") })
        .min(8, { message: t("validation.passwordMin") }),
      password_confirmation: z
        .string()
        .min(1, { message: t("validation.confirmPasswordRequired") }),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t("validation.passwordMismatch"),
      path: ["password_confirmation"],
    });

export const getLoginSchema = (t) =>
  z.object({
    login: z.string().min(1, { message: t("validation.loginRequired") }),
    password: z.string().min(1, { message: t("validation.passwordRequired") }),
  });

export const getForgotPasswordSchema = (t) =>
  z.object({
    email: z
      .string()
      .min(1, { message: t("validation.emailRequired") })
      .email({ message: t("validation.emailInvalid") }),
  });

export const getResetPasswordSchema = (t) =>
  z
    .object({
      password: z
        .string()
        .min(1, { message: t("validation.passwordRequired") })
        .min(8, { message: t("validation.passwordMin") }),
      password_confirmation: z
        .string()
        .min(1, { message: t("validation.confirmPasswordRequired") }),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t("validation.passwordMismatch"),
      path: ["password_confirmation"],
    });
