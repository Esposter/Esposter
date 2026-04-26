import type { SpecialMentionItem } from "@/models/message/SpecialMentionItem";
import type { User } from "@esposter/db-schema";
import type { MentionOptions } from "@tiptap/extension-mention";

import MentionList from "@/components/Message/Model/Message/MentionList.vue";
import { getRender } from "@/services/message/getRender";
import { SpecialMentionItems } from "@/services/message/SpecialMentionItems";
import { useRoomStore } from "@/store/message/room";

export const MentionSuggestion: MentionOptions<SpecialMentionItem | User>["suggestion"] = {
  items: async ({ query }) => {
    const roomStore = useRoomStore();
    const { currentRoomId } = storeToRefs(roomStore);
    if (!currentRoomId.value) return [];

    const normalizedQuery = query.toLowerCase();
    const matchingSpecialMentions = SpecialMentionItems.filter(
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
