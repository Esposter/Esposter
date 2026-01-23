import type { Session } from "#shared/models/auth/Session";
import type { Context } from "@@/server/trpc/context";

export const getIsCreator = (db: Context["db"], session: Session, roomId: string) =>
  db.query.roomsInMessage.findFirst({
    where: (roomsInMessage, { and, eq }) =>
      and(eq(roomsInMessage.id, roomId), eq(roomsInMessage.userId, session.user.id)),
  });
