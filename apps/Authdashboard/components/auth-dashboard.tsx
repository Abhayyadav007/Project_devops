"use client";

import { useState, type FormEvent } from "react";

import { ApiError, signIn } from "@/lib/api";
import { persistAuthSession } from "@/lib/auth";
import {
  AUTH_API_BASE_URL,
  AUTH_ROLE_OPTIONS,
  DASHBOARD_REDIRECT_URL,
  getEndpoint,
  getSignInIdentifierLabel,
  VALIDATOR_SIGNUP_DEFAULTS,
  type AuthRole,
} from "@/lib/constants";

type SignInDraft = {
  identifier: string;
  password: string;
};

function draftForRole(role: AuthRole): SignInDraft {
  if (role === "validator") {
    return {
      identifier: VALIDATOR_SIGNUP_DEFAULTS.userId,
      password: VALIDATOR_SIGNUP_DEFAULTS.password,
    };
  }

  return { identifier: "", password: "" };
}

function toPositiveInteger(value: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("Please enter a valid numeric ID.");
  }

  return parsed;
}

function formatSignInError(submissionError: unknown): string {
  if (submissionError instanceof ApiError) {
    return submissionError.message;
  }
  if (submissionError instanceof Error) {
    return submissionError.message;
  }
  return "Something went wrong while submitting the form.";
}

const ROLE_ICONS: Record<AuthRole, string> = {
  validator: "🛡",
  uppermanagement: "🏛",
  admin: "⚙",
  teacher: "📚",
  student: "🎓",
};

function Field({
  label,
  type,
  value,
  placeholder,
  onChange,
  autoComplete,
  showToggle,
  onToggleShow,
  isVisible,
}: {
  label: string;
  type: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  showToggle?: boolean;
  onToggleShow?: () => void;
  isVisible?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
        {label}
      </span>
      <div className="relative">
        <input
          type={showToggle && isVisible ? "text" : type}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10 focus:shadow-lg focus:shadow-black/5"
        />
        {showToggle && onToggleShow && (
          <button
            type="button"
            onClick={onToggleShow}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors text-xs font-medium px-1"
            tabIndex={-1}
          >
            {isVisible ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </label>
  );
}

export function AuthDashboard() {
  const [role, setRole] = useState<AuthRole>("validator");
  const [draft, setDraft] = useState<SignInDraft>(() => draftForRole("validator"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const activeEndpoint = getEndpoint("signin", role);
  const activeRoleMeta = AUTH_ROLE_OPTIONS.find((option) => option.value === role);

  function selectRole(next: AuthRole) {
    setRole(next);
    setDraft(draftForRole(next));
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await signIn({
        role,
        identifier: toPositiveInteger(draft.identifier),
        password: draft.password.trim(),
      });

      persistAuthSession(response.token, role);
      setSuccess("Signed in successfully. Redirecting...");
      setTimeout(() => {
        const url = new URL(DASHBOARD_REDIRECT_URL);
        url.searchParams.set("token", response.token);
        url.searchParams.set("role", role);
        window.location.assign(url.toString());
      }, 800);
    } catch (submissionError) {
      setError(formatSignInError(submissionError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 text-gray-900 sm:px-6 lg:px-8 bg-animated-gradient">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className="w-full max-w-lg animate-fade-in-up">
          {/* Logo / Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white text-xl font-bold mb-4 shadow-xl shadow-black/10">
              H
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Hope International
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              University Management Platform
            </p>
          </div>

          {/* Card */}
          <div className="rounded-[2rem] border border-gray-200 bg-white/80 backdrop-blur-xl p-6 shadow-xl shadow-black/5 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Authentication
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-black">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Select your role and enter your credentials
            </p>

            {/* Role Selector */}
            <div className="mt-6 flex flex-wrap gap-2">
              {AUTH_ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={role === option.value}
                  onClick={() => selectRole(option.value)}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-300 ${
                    role === option.value
                      ? "border-black bg-black text-white shadow-lg shadow-black/15 scale-105"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:scale-102"
                  }`}
                >
                  <span>{ROLE_ICONS[option.value]}</span>
                  {option.label}
                </button>
              ))}
            </div>

            {activeRoleMeta ? (
              <p className="mt-3 text-sm leading-6 text-gray-500 animate-fade-in">
                {activeRoleMeta.description}
              </p>
            ) : null}

            {/* API Info */}
            <div className="mt-5 grid gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Endpoint:</span>{" "}
                  <span className="font-mono">{AUTH_API_BASE_URL}{activeEndpoint}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Redirect:</span>{" "}
                  <span className="font-mono">{DASHBOARD_REDIRECT_URL}</span>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {success ? (
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 animate-slide-down">
                <span className="text-green-500 text-base">✓</span>
                {success}
              </div>
            ) : null}

            {/* Error Message */}
            {error ? (
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 animate-slide-down">
                <span className="text-red-500 text-base">✕</span>
                {error}
              </div>
            ) : null}

            {/* Form */}
            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <Field
                label={getSignInIdentifierLabel(role)}
                type="text"
                value={draft.identifier}
                placeholder={`Enter ${getSignInIdentifierLabel(role).toLowerCase()}`}
                autoComplete="username"
                onChange={(value) =>
                  setDraft((d) => ({ ...d, identifier: value.replace(/\D/g, "") }))
                }
              />
              <Field
                label="Password"
                type="password"
                value={draft.password}
                placeholder="Enter password"
                autoComplete="current-password"
                onChange={(value) => setDraft((d) => ({ ...d, password: value }))}
                showToggle
                onToggleShow={() => setShowPassword(!showPassword)}
                isVisible={showPassword}
              />

              <button
                type="submit"
                disabled={loading}
                className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-black px-4 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:shadow-black/20 disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400">
              Protected by Hope International Security
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
