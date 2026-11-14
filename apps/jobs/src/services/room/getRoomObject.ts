import { env } from "cloudflare:workers";

// The room's object, named by the room's id. It lives in the realtime Worker, and its stub is typed by the RPC surface it implements
export const getRoomObject = (roomId: string) => env.ROOM.get(env.ROOM.idFromName(roomId));
