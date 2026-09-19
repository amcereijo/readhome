export const BOOK_STATUSES = ["to-read", "reading", "read", "abandoned"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

export const BOOK_FORMATS = ["paperback", "hardcover", "ebook", "audiobook"] as const;
export type BookFormat = (typeof BOOK_FORMATS)[number];

export const STATUS_LABELS: Record<BookStatus, string> = {
  "to-read": "To read",
  reading: "Reading",
  read: "Read",
  abandoned: "Abandoned",
};

export function isBookStatus(value: string): value is BookStatus {
  return (BOOK_STATUSES as readonly string[]).includes(value);
}

export function getStatusLabel(
  dictionary: { status: Record<BookStatus, string> },
  status: BookStatus,
): string {
  return dictionary.status[status];
}

export function getStatusLabelKey(status: BookStatus): string {
  return `status.${status}`;
}

export function isBookFormat(value: string): value is BookFormat {
  return (BOOK_FORMATS as readonly string[]).includes(value);
}

export const RECOMMENDATION_STATUSES = ["pending", "accepted", "dismissed"] as const;
export type RecommendationStatus = (typeof RECOMMENDATION_STATUSES)[number];

export function isRecommendationStatus(value: string): value is RecommendationStatus {
  return (RECOMMENDATION_STATUSES as readonly string[]).includes(value);
}

export type AppUser = {
  id: string;
  clerkId: string;
  username: string | null;
  pendingInviteToken: string | null;
  publicShelfToken: string | null;
  publicShelfEnabled: boolean;
  createdAt: string;
};

export type BookRecord = {
  id: string;
  ownerId: string;
  title: string;
  status: BookStatus;
  formats: BookFormat[];
  startedAt: string | null;
  finishedAt: string | null;
  abandonedAt: string | null;
  dateAdded: string | null;
  note: string | null;
  author: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type RecommendationRecord = {
  id: string;
  senderId: string;
  receiverId: string;
  bookId: string | null;
  title: string;
  author: string | null;
  formats: BookFormat[];
  note: string | null;
  message: string | null;
  reply: string | null;
  replyAt: string | null;
  status: RecommendationStatus;
  sentAt: string;
  seenAt: string | null;
  acceptedAt: string | null;
  dismissedAt: string | null;
};
