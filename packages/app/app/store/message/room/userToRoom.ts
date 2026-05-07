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
  const setUserToRoom = (roomId: string, userId: string, userToRoom: UserToRoomInMessage) => {
    const userToRoomMap = getUserToRoomMap(roomId) ?? new Map<string, UserToRoomInMessage>();
    userToRoomMap.set(userId, userToRoom);
    setUserToRoomMap(roomId, userToRoomMap);
  };
  const getDisplayName = (user: User, roomId: string): string =>
    getUserToRoomMap(roomId)?.get(user.id)?.nickname ?? user.name;
  const updateUserToRoom = async (input: UpdateUserToRoomInput) => {
    await $trpc.userToRoom.updateUserToRoom.mutate(input);
  };
  return {
    getDisplayName,
    getUserToRoomMap,
    setUserToRoom,
    updateUserToRoom,
    userToRoomMap,
  };
});
