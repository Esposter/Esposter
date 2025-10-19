import type { Session } from "#shared/models/auth/Session";
import type { Context } from "@@/server/trpc/context";

export const getIsCreator = (db: Context["db"], session: Session, roomId: string) =>
  db.query.rooms.findFirst({
    where: (rooms, { and, eq }) => and(eq(rooms.id, roomId), eq(rooms.userId, session.user.id)),
  });
