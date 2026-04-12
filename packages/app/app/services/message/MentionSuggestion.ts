import type { SpecialMentionItem } from "@/models/message/SpecialMentionItem";
import type { User } from "@esposter/db-schema";
import type { MentionOptions } from "@tiptap/extension-mention";

import MentionList from "@/components/Message/Model/Message/MentionList.vue";
import { getRender } from "@/services/message/getRender";
import { useRoomStore } from "@/store/message/room";
import { MENTION_EVERYONE_ID, MENTION_HERE_ID } from "@esposter/shared";

const SPECIAL_MENTIONS: SpecialMentionItem[] = [
  { id: MENTION_EVERYONE_ID, image: null, name: "everyone" },
  { id: MENTION_HERE_ID, image: null, name: "here" },
];

export const MentionSuggestion: MentionOptions<User | SpecialMentionItem>["suggestion"] = {
  items: async ({ query }) => {
    const roomStore = useRoomStore();
    const { currentRoomId } = storeToRefs(roomStore);
    if (!currentRoomId.value) return [];

    const normalizedQuery = query.toLowerCase();
    const matchingSpecialMentions = SPECIAL_MENTIONS.filter(
      (specialMentionItem) => !query || specialMentionItem.name.startsWith(normalizedQuery),
    );

    const { $trpc } = useNuxtApp();
    const { items } = await $trpc.room.readMembers.query({
      filter: query ? { name: query } : undefined,
      roomId: currentRoomId.value,
    });
    return [...matchingSpecialMentions, ...items];
  },
  render: getRender(MentionList),
};
