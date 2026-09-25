import type { BroadcastMentionItem } from "@/models/message/BroadcastMentionItem";
import type { MentionNodeAttributes } from "@/models/message/MentionNodeAttributes";
import type { RoleMentionItem } from "@/models/message/RoleMentionItem";
import type { User } from "@esposter/db-schema";
import type { MentionOptions } from "@tiptap/extension-mention";

import MentionList from "@/components/Message/Model/Message/Suggestion/MentionList.vue";
import { getBroadcastMentionItems } from "@/services/message/getBroadcastMentionItems";
import { getRender } from "@/services/message/getRender";
import { getRoleMentionItems } from "@/services/message/getRoleMentionItems";
import { readMemberMentionItems } from "@/services/message/readMemberMentionItems";
import { useRoomStore } from "@/store/message/room";
import { PluginKey } from "@tiptap/pm/state";

export const MentionSuggestion: MentionOptions<
  BroadcastMentionItem | RoleMentionItem | User,
  MentionNodeAttributes
>["suggestion"] = {
  items: async ({ query }) => {
    const roomStore = useRoomStore();
    const { currentRoomId } = storeToRefs(roomStore);
    const roomId = currentRoomId.value;
    if (!roomId) return [];
    // Every kind of item names the room the query was typed in, since the member read spans an await
    const members = await readMemberMentionItems(query, roomId);
    return [...getBroadcastMentionItems(query), ...getRoleMentionItems(query, roomId), ...members];
  },
  pluginKey: new PluginKey("mentionSuggestion"),
  render: getRender(MentionList),
};
