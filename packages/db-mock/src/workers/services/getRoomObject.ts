import type { Rpc } from "@cloudflare/workers-types";
import type { RoomObjectRpc } from "@esposter/db-schema";

import { createObjectStub } from "#src/workers/services/createObjectStub";
import { roomObjectCalls } from "#src/workers/services/roomObjectCalls";
import { roomObjectReplies } from "#src/workers/services/roomObjectReplies";

// A room's object as the jobs Worker reaches it
export const getRoomObject = (roomId: string): DurableObjectStub<RoomObjectRpc & Rpc.DurableObjectBranded> =>
  createObjectStub<RoomObjectRpc>(roomId, roomObjectCalls, roomObjectReplies);
