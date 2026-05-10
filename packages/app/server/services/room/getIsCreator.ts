import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

export const getIsCreator = (db: Context["db"], { user }: GetSessionPayload, roomId: string) =>
  db.query.roomsInMessage.findFirst({
    where: {
      id: {
        eq: roomId,
      },
      userId: {
        eq: user.id,
      },
    },
  });
