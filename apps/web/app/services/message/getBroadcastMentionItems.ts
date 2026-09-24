import { BroadcastMentionItems } from "@/services/message/BroadcastMentionItems";

export const getBroadcastMentionItems = (query: string) =>
  BroadcastMentionItems.filter((item) => !query || item.name.startsWith(query.toLowerCase()));
