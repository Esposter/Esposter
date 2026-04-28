import type { Context } from "@@/server/trpc/context";

import { hasPermission } from "@@/server/services/room/rbac/hasPermission";
import { RoomPermission } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";

export const assertNotReadOnly = async (db: Context["db"], userId: string, roomId: string) => {
  const room = await db.query.roomsInMessage.findFirst({
    columns: { isReadOnly: true },
    where: { id: { eq: roomId } },
  });
  if (!room?.isReadOnly) return;
  const canBypass = await hasPermission(db, userId, roomId, RoomPermission.ManageMessages);
  if (!canBypass) throw new TRPCError({ code: "FORBIDDEN" });
};
