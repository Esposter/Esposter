import { type User } from "@/db/schema/users";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/cursor/createCursorPaginationDataMap";
import { useRoomStore } from "@/store/esbabbler/room";

export const useMemberStore = defineStore("esbabbler/member", () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const {
    itemList: memberList,
    pushItemList: pushMemberList,
    ...rest
  } = createCursorPaginationDataMap<User>(currentRoomId);
  return {
    memberList,
    pushMemberList,
    ...rest,
  };
});
