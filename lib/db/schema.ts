import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    clerkId: text("clerk_id").notNull().unique(),
    username: text("username").unique(),
    pendingInviteToken: text("pending_invite_token"),
    publicShelfToken: text("public_shelf_token"),
    publicShelfEnabled: text("public_shelf_enabled").notNull().default("0"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("users_public_shelf_token").on(table.publicShelfToken)],
);

export const books = sqliteTable("books", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  status: text("status").notNull(),
  formatsJson: text("formats_json").notNull().default("[]"),
  startedAt: text("started_at"),
  finishedAt: text("finished_at"),
  abandonedAt: text("abandoned_at"),
  dateAdded: text("date_added"),
  note: text("note"),
  author: text("author"),
  metadataJson: text("metadata_json").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const friendships = sqliteTable(
  "friendships",
  {
    id: text("id").primaryKey(),
    requesterId: text("requester_id")
      .notNull()
      .references(() => users.id),
    addresseeId: text("addressee_id")
      .notNull()
      .references(() => users.id),
    status: text("status").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("friendships_pair").on(table.requesterId, table.addresseeId)],
);

export const inviteLinks = sqliteTable("invite_links", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  usedAt: text("used_at"),
  createdAt: text("created_at").notNull(),
});

export const recommendations = sqliteTable("recommendations", {
  id: text("id").primaryKey(),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id),
  receiverId: text("receiver_id")
    .notNull()
    .references(() => users.id),
  bookId: text("book_id").references(() => books.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  author: text("author"),
  formatsJson: text("formats_json").notNull().default("[]"),
  note: text("note"),
  message: text("message"),
  reply: text("reply"),
  replyAt: text("reply_at"),
  status: text("status").notNull(),
  sentAt: text("sent_at").notNull(),
  seenAt: text("seen_at"),
  acceptedAt: text("accepted_at"),
  dismissedAt: text("dismissed_at"),
});
