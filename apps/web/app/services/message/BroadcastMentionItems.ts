import type { BroadcastMentionItem } from "@/models/message/BroadcastMentionItem";

import { MENTION_EVERYONE_ID, MENTION_HERE_ID } from "@esposter/shared";

export const BroadcastMentionItems: BroadcastMentionItem[] = [
  { id: MENTION_EVERYONE_ID, image: null, name: "everyone" },
  { id: MENTION_HERE_ID, image: null, name: "here" },
];
