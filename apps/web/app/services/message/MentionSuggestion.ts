import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { BroadcastMentionItem } from "#src/models/message/BroadcastMentionItem";
import type { MentionNodeAttributes } from "#src/models/message/MentionNodeAttributes";
import type { RoleMentionItem } from "#src/models/message/RoleMentionItem";
import type { MentionOptions } from "@tiptap/extension-mention";

import MentionList from "#src/components/Message/Model/Message/Suggestion/MentionList.vue";
import { getBroadcastMentionItems } from "#src/services/message/getBroadcastMentionItems";
import { getRender } from "#src/services/message/getRender";
import { getRoleMentionItems } from "#src/services/message/getRoleMentionItems";
import { readMemberMentionItems } from "#src/services/message/readMemberMentionItems";
import { useRoomStore } from "#src/store/message/room/index";
import { PluginKey } from "@tiptap/pm/state";

export const MentionSuggestion: MentionOptions<
  BroadcastMentionItem | MemberInRoom | RoleMentionItem,
  MentionNodeAttributes
>["suggestion"] = {
  items: async ({ query }) => {
    const roomStore = useRoomStore();
    const { currentRoomId } = storeToRefs(roomStore);
    const roomId = currentRoomId.value;
    if (!roomId) return [];
    // Every kind of item names the room the query was typed in, since the member read spans an await
    const members = await readMemberMentionItems(query, roomId);
    return [...getBroadcastMentionItems(query, roomId), ...getRoleMentionItems(query, roomId), ...members];
  },
  pluginKey: new PluginKey("mentionSuggestion"),
  render: getRender(MentionList),
};
