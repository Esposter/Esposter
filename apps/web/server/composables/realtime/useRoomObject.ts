import { recordObjectReads } from "#server/services/realtime/recordObjectReads";
import { getObjectStub } from "@esposter/db";
import { env } from "cloudflare:workers";

// The room's object, named by the room's id. Its stub is typed by the class the realtime Worker exports, and each RPC it is
// Called with records the read set the room reports into the request in scope
export const useRoomObject = (roomId: string) => getObjectStub(env.ROOM, roomId, recordObjectReads);
