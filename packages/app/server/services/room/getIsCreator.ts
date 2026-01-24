import type { Session } from "#shared/models/auth/Session";
import type { Context } from "@@/server/trpc/context";

export const getIsCreator = (db: Context["db"], session: Session, roomId: string) =>
  db.query.roomsInMessage.findFirst({
    where: {
      id: {
        eq: roomId,
      },
      userId: {
        eq: session.user.id,
      },
    },
  });
