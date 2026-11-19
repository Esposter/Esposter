import { getObjectStub } from "@esposter/db";
import { env } from "cloudflare:workers";

// The room's object, named by the room's id. Its stub is typed by the class the realtime Worker exports, and each RPC it is
// Called with runs through the room's invoke
export const getRoomObject = (roomId: string) => getObjectStub(env.ROOM, roomId);
