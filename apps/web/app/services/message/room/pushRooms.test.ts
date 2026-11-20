import type { RoomInMessage } from "@esposter/db-schema";

import { useSessionUserId } from "#src/composables/auth/useSessionUserId";
import { roomTable } from "#src/services/message/room/constants";
import { createUserToRoom } from "#src/services/message/room/createUserToRoom.test";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { useOverlayStore } from "#src/store/overlay";
import { describe } from "vitest";

// Holds rooms the way a read does, with the signed-in reader's live membership of each, so the list shows them.
// In a test that has signed no one in, the reader is the empty id, which is the id the membership is written under
export const pushRooms = (...rooms: RoomInMessage[]) => {
  const overlayStore = useOverlayStore();
  const { arrive } = overlayStore;
  const userId = useSessionUserId();
  const userToRoomStore = useUserToRoomStore();
  const { arriveUserToRooms } = userToRoomStore;
  for (const room of rooms) arrive(roomTable, room);
  arriveUserToRooms(rooms.map(({ id }) => createUserToRoom({ roomId: id, userId: userId.value })));
};

describe.todo("pushRooms");
