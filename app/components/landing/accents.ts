export type FeatureAccent = {
  bg: string;
  ring: string;
  badge: string;
  badgeText: string;
  pill: string;
  pillText: string;
  glow: string;
  emoji: string;
};

// Each feature gets its own warm colour so the landing page reads as a
// rainbow shelf. Backgrounds are pale tints that pair with the page base.
export const FEATURE_ACCENTS: Record<string, FeatureAccent> = {
  "add-book": {
    bg: "bg-amber-50",
    ring: "ring-amber-200/70",
    badge: "bg-amber-100",
    badgeText: "text-amber-700",
    pill: "bg-amber-100",
    pillText: "text-amber-800",
    glow: "bg-amber-300/30",
    emoji: "✨",
  },
  shelf: {
    bg: "bg-emerald-50",
    ring: "ring-emerald-200/70",
    badge: "bg-emerald-100",
    badgeText: "text-emerald-700",
    pill: "bg-emerald-100",
    pillText: "text-emerald-800",
    glow: "bg-emerald-300/30",
    emoji: "📚",
  },
  statuses: {
    bg: "bg-rose-50",
    ring: "ring-rose-200/70",
    badge: "bg-rose-100",
    badgeText: "text-rose-700",
    pill: "bg-rose-100",
    pillText: "text-rose-800",
    glow: "bg-rose-300/30",
    emoji: "🎯",
  },
  statistics: {
    bg: "bg-orange-50",
    ring: "ring-orange-200/70",
    badge: "bg-orange-100",
    badgeText: "text-orange-700",
    pill: "bg-orange-100",
    pillText: "text-orange-800",
    glow: "bg-orange-300/30",
    emoji: "📈",
  },
  "public-share": {
    bg: "bg-fuchsia-50",
    ring: "ring-fuchsia-200/70",
    badge: "bg-fuchsia-100",
    badgeText: "text-fuchsia-700",
    pill: "bg-fuchsia-100",
    pillText: "text-fuchsia-800",
    glow: "bg-fuchsia-300/30",
    emoji: "🔗",
  },
  friends: {
    bg: "bg-teal-50",
    ring: "ring-teal-200/70",
    badge: "bg-teal-100",
    badgeText: "text-teal-700",
    pill: "bg-teal-100",
    pillText: "text-teal-800",
    glow: "bg-teal-300/30",
    emoji: "👋",
  },
  "friend-shelf": {
    bg: "bg-indigo-50",
    ring: "ring-indigo-200/70",
    badge: "bg-indigo-100",
    badgeText: "text-indigo-700",
    pill: "bg-indigo-100",
    pillText: "text-indigo-800",
    glow: "bg-indigo-300/30",
    emoji: "🎁",
  },
  recommendations: {
    bg: "bg-pink-50",
    ring: "ring-pink-200/70",
    badge: "bg-pink-100",
    badgeText: "text-pink-700",
    pill: "bg-pink-100",
    pillText: "text-pink-800",
    glow: "bg-pink-300/30",
    emoji: "💌",
  },
  "goodreads-import": {
    bg: "bg-yellow-50",
    ring: "ring-yellow-200/70",
    badge: "bg-yellow-100",
    badgeText: "text-yellow-800",
    pill: "bg-yellow-100",
    pillText: "text-yellow-900",
    glow: "bg-yellow-300/30",
    emoji: "📥",
  },
};

export const HERO_ACCENT: FeatureAccent = {
  bg: "bg-gradient-to-br from-amber-50 via-rose-50 to-sky-50",
  ring: "ring-rose-200/60",
  badge: "bg-gradient-to-r from-amber-200 to-rose-200",
  badgeText: "text-rose-800",
  pill: "bg-rose-100",
  pillText: "text-rose-800",
  glow: "bg-amber-300/40",
  emoji: "🎉",
};

export function accentFor(key: string): FeatureAccent {
  return FEATURE_ACCENTS[key] ?? HERO_ACCENT;
}
