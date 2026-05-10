import type { SpecialMentionItem } from "@/models/message/SpecialMentionItem";

import { MENTION_EVERYONE_ID, MENTION_HERE_ID } from "@esposter/shared";

export const SpecialMentionItems: SpecialMentionItem[] = [
  { id: MENTION_EVERYONE_ID, image: null, name: "everyone" },
  { id: MENTION_HERE_ID, image: null, name: "here" },
];
