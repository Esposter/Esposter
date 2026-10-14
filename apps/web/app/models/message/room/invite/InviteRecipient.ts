import type { PublicUser } from "@esposter/db-schema";

// A friend or a group conversation: each is sent the room's link into its direct message, and both sit in one list
// Ordered by recency, so a group reads where the conversation with it does
export interface InviteRecipient {
  id: string;
  image: PublicUser["image"];
  isGroup: boolean;
  name: string;
  recency: number;
}
