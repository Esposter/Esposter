import type { BroadcastMentionItem } from "@/models/message/BroadcastMentionItem";

import { BroadcastMentionItems } from "@/services/message/BroadcastMentionItems";

export const getBroadcastMentionItems = (query: string): BroadcastMentionItem[] =>
  BroadcastMentionItems.filter((item) => !query || item.name.startsWith(query.toLowerCase()));
