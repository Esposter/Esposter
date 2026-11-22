import type { MemberRow } from "#shared/models/db/room/MemberRow";

// A list names each of its members by the room and the user, and the rows themselves are the overlay's
export type MemberKey = Pick<MemberRow, "roomId" | "userId">;
