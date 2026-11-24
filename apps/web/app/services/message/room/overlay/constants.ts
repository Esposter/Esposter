import type { Table } from "#src/models/shared/overlay/Table";
import type { InviteInMessage, PublicWebhookInMessage, RoomEmojiWithPresignedUrl } from "@esposter/db-schema";

import { createTable } from "#src/services/shared/overlay/createTable";
import { invitesInMessage, roomEmojisInMessage, webhooksInMessage } from "@esposter/db-schema";

// The room emoji, invite and webhook rows, held on the overlay: one slot each.
// A read of an emoji carries its presigned URL.
// A webhook is held without its token hash, which no read or write answers, so the webhook table names that row.
export const roomEmojiTable: Table<RoomEmojiWithPresignedUrl, typeof roomEmojisInMessage> =
  createTable(roomEmojisInMessage);
export const inviteTable: Table<InviteInMessage, typeof invitesInMessage> = createTable(invitesInMessage);
export const webhookTable: Table<PublicWebhookInMessage, typeof webhooksInMessage> = createTable<
  typeof webhooksInMessage,
  PublicWebhookInMessage
>(webhooksInMessage);
