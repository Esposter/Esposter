import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

export const getIsCreator = (db: Context["db"], { user }: GetSessionPayload, roomId: string) =>
  db.query.rooms.findFirst({
    where: (rooms, { and, eq }) => and(eq(rooms.id, roomId), eq(rooms.userId, user.id)),
  });
