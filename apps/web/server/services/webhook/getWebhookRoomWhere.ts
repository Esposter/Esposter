import type { RoomInMessage, WebhookInMessage } from "@esposter/db-schema";

import { webhooksInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// A webhook is addressed by both keys so the room the permission was checked against is the room the row must
// Belong to — an id alone would let a moderator of one room rewrite another's
export const getWebhookRoomWhere = (id: WebhookInMessage["id"], roomId: RoomInMessage["id"]) =>
  and(eq(webhooksInMessage.id, id), eq(webhooksInMessage.roomId, roomId));
