import { clearObjectStub } from "#src/workers/services/clearObjectStub";
import { roomObjectCalls } from "#src/workers/services/roomObjectCalls";
import { roomObjectReplies } from "#src/workers/services/roomObjectReplies";

export const clearRoomObjectCalls = (): void => {
  clearObjectStub(roomObjectCalls, roomObjectReplies);
};
