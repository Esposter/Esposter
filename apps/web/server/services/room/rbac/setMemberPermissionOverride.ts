import type { Context } from "#server/trpc/context";

import { roomMemberPermissionsInMessage } from "@esposter/db-schema";
import { and, eq, sql } from "drizzle-orm";

interface SetMemberPermissionOverrideOptions {
  allow: bigint;
  deny: bigint;
  inherit: bigint;
  roomId: string;
  userId: string;
}

// The three bitfields move a bit between states, so the write clears every bit it names from both fields before it
// Sets the ones it allows or denies. Passing a bit into the opposite field therefore moves it rather than leaving it
// Set in both, which the table's CHECK would refuse. A row with neither field set is the member's roles again, so it
// Is removed rather than kept as an empty entry
export const setMemberPermissionOverride = (
  db: Context["db"],
  { allow, deny, inherit, roomId, userId }: SetMemberPermissionOverrideOptions,
): Promise<void> => {
  const {
    allow: allowColumn,
    deny: denyColumn,
    roomId: roomIdColumn,
    userId: userIdColumn,
  } = roomMemberPermissionsInMessage;
  const isMemberRow = and(eq(roomIdColumn, roomId), eq(userIdColumn, userId));
  const clearedBits = sql`(${(allow | deny | inherit).toString()}::bigint)`;
  return db.transaction(async (tx) => {
    if (allow | deny)
      await tx
        .insert(roomMemberPermissionsInMessage)
        .values({ allow, deny, roomId, userId })
        .onConflictDoUpdate({
          set: {
            allow: sql`((${allowColumn} & ~${clearedBits}) | ${allow.toString()}::bigint)`,
            deny: sql`((${denyColumn} & ~${clearedBits}) | ${deny.toString()}::bigint)`,
          },
          target: [userIdColumn, roomIdColumn],
        });
    else
      await tx
        .update(roomMemberPermissionsInMessage)
        .set({ allow: sql`(${allowColumn} & ~${clearedBits})`, deny: sql`(${denyColumn} & ~${clearedBits})` })
        .where(isMemberRow);
    await tx.delete(roomMemberPermissionsInMessage).where(and(isMemberRow, eq(allowColumn, 0n), eq(denyColumn, 0n)));
  });
};
