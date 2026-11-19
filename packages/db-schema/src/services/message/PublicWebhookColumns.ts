import type { PublicWebhookInMessage } from "#src/models/message/PublicWebhookInMessage";

// The columns a relational read takes for a webhook a response carries. An allowlist, so a column the table gains is
// Withheld until it is named here, and the hash of the credential is never named: PublicWebhookInMessage leaves it out
export const PublicWebhookColumns = {
  createdAt: true,
  creatorId: true,
  deletedAt: true,
  id: true,
  isActive: true,
  name: true,
  roomId: true,
  updatedAt: true,
  userId: true,
  version: true,
} as const satisfies Record<keyof PublicWebhookInMessage, true>;
