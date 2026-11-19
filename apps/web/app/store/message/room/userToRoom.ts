import type { RoomInMessage, UserToRoomInMessage } from "@esposter/db-schema";

import { useRoomStore } from "#src/store/message/room/index";
import { noop } from "@esposter/shared";

export const useUserToRoomStore = defineStore("message/room/userToRoom", () => {
  const roomStore = useRoomStore();
  // The viewer's own row is written from more than one panel, so every write queues on this one executor rather than
  // On a per-panel one that cannot see the other's writes to the same room
  const { executeMutation: executeUserToRoomMutation } = useMutation();
  const {
    data: myUserToRoom,
    getData: getMyUserToRoom,
    setData: setMyUserToRoom,
  } = useDataMap<undefined | UserToRoomInMessage>(() => roomStore.currentRoomId, undefined);
  // Shows one field of the viewer's row ahead of the server's answer, and returns the undo for it. The undo puts back
  // Only that field, against the record as it stands, since reinstating the row as a whole would undo everything else
  // That landed on it while this write was in flight
  const applyMyUserToRoomField = <K extends keyof UserToRoomInMessage>(
    roomId: RoomInMessage["id"],
    field: K,
    value: UserToRoomInMessage[K],
  ) => {
    const previousUserToRoom = getMyUserToRoom(roomId);
    if (!previousUserToRoom) return noop;

    const previousValue = previousUserToRoom[field];
    setMyUserToRoom(roomId, { ...previousUserToRoom, [field]: value });
    return () => {
      const currentUserToRoom = getMyUserToRoom(roomId);
      if (currentUserToRoom) setMyUserToRoom(roomId, { ...currentUserToRoom, [field]: previousValue });
    };
  };
  return { applyMyUserToRoomField, executeUserToRoomMutation, getMyUserToRoom, myUserToRoom, setMyUserToRoom };
});
