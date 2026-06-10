import type { User, UserToRoomInMessage } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";

export const useUserToRoomStore = defineStore("message/room/userToRoom", () => {
  const roomStore = useRoomStore();
  const {
    data: myUserToRoomMap,
    getData: getMyUserToRoom,
    setData: setMyUserToRoom,
  } = useDataMap<undefined | UserToRoomInMessage>(() => roomStore.currentRoomId, undefined);
  const { getData: getNicknameMap, setData: setNicknameMap } = useDataMap(
    () => roomStore.currentRoomId,
    new Map<string, string>(),
  );
  const setNickname = (roomId: string, userId: string, nickname: string) => {
    const nicknameMap = getNicknameMap(roomId) ?? new Map<string, string>();
    nicknameMap.set(userId, nickname);
    setNicknameMap(roomId, nicknameMap);
  };
  const getDisplayName = (user: User, roomId: string): string => getNicknameMap(roomId)?.get(user.id) || user.name;
  return {
    getDisplayName,
    getMyUserToRoom,
    myUserToRoomMap,
    setMyUserToRoom,
    setNickname,
  };
});
