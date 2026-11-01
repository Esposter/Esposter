import { BroadcastMentionItems } from "@/services/message/BroadcastMentionItems";
import { useRoleStore } from "@/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";

// The two mentions that notify the whole room are offered only to a member who holds `MentionEveryone`: the server
// Strips them from anyone else's message, so offering them would promise a notification nobody gets
export const getBroadcastMentionItems = (query: string, roomId: string) => {
  const roleStore = useRoleStore();
  const { checkHasMyPermission } = roleStore;
  if (!checkHasMyPermission(roomId, RoomPermission.MentionEveryone)) return [];

  const normalizedQuery = query.toLowerCase();
  return BroadcastMentionItems.filter((item) => !normalizedQuery || item.name.startsWith(normalizedQuery));
};
