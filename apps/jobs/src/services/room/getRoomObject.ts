import { getObjectStub } from "@esposter/db";
import { env } from "cloudflare:workers";

// The room's object, named by the room's id. It lives in the realtime Worker, and each RPC it is called with runs
// Through the Room's invoke, so the writes it makes are published by the room
export const getRoomObject = (roomId: string) => getObjectStub(env.ROOM, roomId);
