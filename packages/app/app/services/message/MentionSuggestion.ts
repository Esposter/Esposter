import type { User } from "@esposter/db-schema";
import type { MentionOptions } from "@tiptap/extension-mention";

import MentionList from "@/components/Message/Model/Message/MentionList.vue";
import { getRender } from "@/services/message/getRender";
import { useRoomStore } from "@/store/message/room";

export const MentionSuggestion: MentionOptions<User>["suggestion"] = {
  items: async ({ query }) => {
    const roomStore = useRoomStore();
    const { currentRoomId } = storeToRefs(roomStore);
    if (!currentRoomId.value) return [];

    const { $trpc } = useNuxtApp();
    const { items } = await $trpc.room.readMembers.query({
      filter: query ? { name: query } : undefined,
      roomId: currentRoomId.value,
    });
    return items;
  },
  render: getRender(MentionList),
};
