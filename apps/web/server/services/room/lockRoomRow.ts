import type { Transaction } from "#server/models/db/Transaction";

import { roomsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// A room's pause and its caps are read with no constraint behind them, so two transactions that both check one before
// Either writes would both pass. Taking the room row first makes the second wait for the first to commit, and then
// Check what it committed
export const lockRoomRow = async (tx: Transaction, roomId: string): Promise<void> => {
  await tx.select({ id: roomsInMessage.id }).from(roomsInMessage).where(eq(roomsInMessage.id, roomId)).for("update");
};
