import type { RoomInMessage } from "@esposter/db-schema";

import { TRPCError } from "@trpc/server";

export const assertNotReadOnly = async (
  room: Pick<RoomInMessage, "isReadOnly"> | undefined,
  getCanManageMessages: () => Promise<boolean>,
): Promise<void> => {
  if (!room?.isReadOnly) return;
  if (!(await getCanManageMessages())) throw new TRPCError({ code: "FORBIDDEN" });
};
