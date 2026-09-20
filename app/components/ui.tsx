import Link from "next/link";
import type { ReactNode } from "react";
import { type BookStatus, getStatusLabel } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function cn(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function buttonClasses(
  variant: "primary" | "secondary" | "danger" | "ghost" = "primary",
  className?: string,
) {
  const variants = {
    primary: "bg-teal-700 text-white hover:bg-teal-800 focus:ring-teal-600",
    secondary: "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100",
  };

  return cn(
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50",
    variants[variant],
    className,
  );
}

export function iconButtonClasses(
  variant: "primary" | "secondary" | "danger" | "ghost" = "secondary",
  className?: string,
) {
  const variants = {
    primary: "bg-teal-700 text-white hover:bg-teal-800 focus:ring-teal-600",
    secondary: "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 hover:text-zinc-900",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100",
  };

  return cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50",
    variants[variant],
    className,
  );
}

export function Button({
  type = "button",
  children,
  variant = "primary",
  className,
  asChild,
  loading = false,
  loadingText,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  asChild?: never;
  loading?: boolean;
  loadingText?: ReactNode;
}) {
  if (asChild) {
    return null;
  }

  return (
    <button
      type={type}
      className={buttonClasses(variant, className)}
      aria-busy={loading || undefined}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="app-spinner inline-block h-4 w-4 border-2"
          />
          {loadingText ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function IconButton({
  type = "button",
  variant = "secondary",
  className,
  icon,
  loading = false,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon: ReactNode;
  "aria-label": string;
  loading?: boolean;
}) {
  return (
    <button
      type={type}
      className={iconButtonClasses(variant, className)}
      aria-busy={loading || undefined}
      disabled={loading || props.disabled}
      {...props}
    >
      <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center">
        {loading ? (
          <span
            aria-hidden="true"
            className="app-spinner inline-block h-4 w-4 border-2"
          />
        ) : (
          icon
        )}
      </span>
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  className,
  title,
  "aria-label": ariaLabel,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  title?: string;
  "aria-label"?: string;
}) {
  return (
    <Link href={href} className={buttonClasses(variant, className)} title={title} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

export function IconLinkButton({
  href,
  variant = "secondary",
  className,
  icon,
  ...props
}: {
  href: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  icon: ReactNode;
  "aria-label": string;
  title?: string;
}) {
  return (
    <Link href={href} className={iconButtonClasses(variant, className)} {...props}>
      <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center">
        {icon}
      </span>
    </Link>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600",
        className,
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-zinc-700">
      {children}
    </label>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-zinc-200 bg-white p-5 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{children}</h1>;
}

export function PageSubtitle({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-sm text-zinc-600">{children}</p>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-sm text-zinc-500">{children}</p>;
}

export function ErrorMessage({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{children}</p>;
}

export function SuccessMessage({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800">{children}</p>;
}

export function StatusBadge({ status, dictionary }: { status: BookStatus; dictionary: Dictionary }) {
  const colors: Record<BookStatus, string> = {
    "to-read": "bg-amber-100 text-amber-800",
    reading: "bg-sky-100 text-sky-800",
    read: "bg-emerald-100 text-emerald-800",
    abandoned: "bg-zinc-200 text-zinc-700",
  };

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", colors[status])}>
      {getStatusLabel(dictionary, status)}
    </span>
  );
}

export function StyledLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-teal-700 underline-offset-2 hover:text-teal-800 hover:underline">
      {children}
    </Link>
  );
}

export function Spinner({
  size = 16,
  className,
  label,
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  const dim = `${size}px`;
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-2 align-middle", className)}
    >
      <span
        aria-hidden="true"
        className="app-spinner shrink-0"
        style={{
          width: dim,
          height: dim,
          borderWidth: Math.max(2, Math.round(size / 8)),
        }}
      />
      {label ? <span className="text-sm">{label}</span> : null}
    </span>
  );
}

export function PageLoading({ label }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-zinc-500"
    >
      <span
        aria-hidden="true"
        className="app-spinner"
        style={{ width: "32px", height: "32px", borderWidth: "3px", color: "#0f766e" }}
      />
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold text-zinc-900">{children}</h2>;
}
