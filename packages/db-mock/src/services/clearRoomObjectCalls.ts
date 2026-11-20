import { clearObjectStub } from "#src/services/clearObjectStub";
import { roomObjectCalls } from "#src/services/roomObjectCalls";
import { roomObjectReplies } from "#src/services/roomObjectReplies";

export const clearRoomObjectCalls = (): void => {
  clearObjectStub(roomObjectCalls, roomObjectReplies);
};
