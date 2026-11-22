import type { BanInRoom } from "#shared/models/db/room/BanInRoom";

// A list names each of its rows by the room and the user it bans, and the rows themselves are the overlay's
export type BanKey = Pick<BanInRoom, "roomId" | "userId">;
