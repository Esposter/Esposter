import type { Context } from "@@/server/trpc/context";

import { hasPermission } from "@@/server/services/room/rbac/hasPermission";
import { RoomPermission } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";

export const assertNotWordFiltered = async (db: Context["db"], userId: string, roomId: string, messageText: string) => {
  const filter = await db.query.roomFiltersInMessage.findFirst({
    columns: { words: true },
    where: { roomId: { eq: roomId } },
  });
  if (!filter?.words.length) return;
  const canBypass = await hasPermission(db, userId, roomId, RoomPermission.ManageMessages);
  if (canBypass) return;
  const lower = messageText.toLowerCase();
  if (filter.words.some((word) => lower.includes(word.toLowerCase())))
    throw new TRPCError({ code: "FORBIDDEN", message: "Message contains blocked content." });
};
