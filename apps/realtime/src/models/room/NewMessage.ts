import type { messagesInRoom } from "@esposter/db-schema";

export type NewMessage = typeof messagesInRoom.$inferInsert;
