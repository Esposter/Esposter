import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import type { User, UserToRoomInMessage } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";

export const useUserToRoomStore = defineStore("message/room/userToRoom", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const {
    data: userToRoomMap,
    getData: getUserToRoomMap,
    setData: setUserToRoomMap,
  } = useDataMap(() => roomStore.currentRoomId, new Map<string, UserToRoomInMessage>());
  const { getData: getNicknameMap, setData: setNicknameMap } = useDataMap(
    () => roomStore.currentRoomId,
    new Map<string, string>(),
  );
  const setUserToRoom = (roomId: string, userId: string, userToRoom: UserToRoomInMessage) => {
    const roomUserMap = getUserToRoomMap(roomId) ?? new Map<string, UserToRoomInMessage>();
    roomUserMap.set(userId, userToRoom);
    setUserToRoomMap(roomId, roomUserMap);
  };
  const setNickname = (roomId: string, userId: string, nickname: string) => {
    const roomNicknameMap = getNicknameMap(roomId) ?? new Map<string, string>();
    roomNicknameMap.set(userId, nickname);
    setNicknameMap(roomId, roomNicknameMap);
  };
  const getDisplayName = (user: User, roomId: string): string => getNicknameMap(roomId)?.get(user.id) || user.name;
  const updateUserToRoom = async (input: UpdateUserToRoomInput) => {
    await $trpc.userToRoom.updateUserToRoom.mutate(input);
  };
  return {
    getDisplayName,
    getUserToRoomMap,
    setNickname,
    setUserToRoom,
    updateUserToRoom,
    userToRoomMap,
  };
});
