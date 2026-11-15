import type { Page, RoomMessage } from "@esposter/db-schema";

// A hit names the room it is in, since one search reads several rooms and a hit is opened in its own room
export type SearchMessagesResult = Page<RoomMessage & { roomId: string }> & { count?: number };
