import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { PublicUser, UserToRoomInMessage } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";

export const useUserToRoomStore = defineStore("message/room/userToRoom", () => {
  const roomStore = useRoomStore();
  const {
    data: myUserToRoom,
    getData: getMyUserToRoom,
    setData: setMyUserToRoom,
  } = useDataMap<undefined | UserToRoomInMessage>(() => roomStore.currentRoomId, undefined);
  const { getData: getDisplayNameMap, setData: setDisplayNameMap } = useDataMap(
    () => roomStore.currentRoomId,
    new Map<string, string>(),
  );
  const setDisplayName = (roomId: string, userId: string, displayName: string) => {
    const displayNameMap = getDisplayNameMap(roomId) ?? new Map<string, string>();
    displayNameMap.set(userId, displayName);
    setDisplayNameMap(roomId, displayNameMap);
  };
  const getDisplayName = (
    { displayName, id, name }: Partial<Pick<MemberInRoom, "displayName">> & Pick<PublicUser, "id" | "name">,
    roomId: string,
  ) => displayName || getDisplayNameMap(roomId)?.get(id) || name;
  return { getDisplayName, getMyUserToRoom, myUserToRoom, setDisplayName, setMyUserToRoom };
});
