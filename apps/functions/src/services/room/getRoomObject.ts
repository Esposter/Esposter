import { env } from "cloudflare:workers";

// The room's object, named by the room's id. Its stub is typed by the class the functions Worker exports
export const getRoomObject = (roomId: string) => env.ROOM.get(env.ROOM.idFromName(roomId));
