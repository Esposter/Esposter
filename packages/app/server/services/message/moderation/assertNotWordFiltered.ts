import type { RoomFilterInMessage } from "@esposter/db-schema";

import { TRPCError } from "@trpc/server";

export const assertNotWordFiltered = async (
  filter: Pick<RoomFilterInMessage, "words"> | undefined,
  messageText: string,
  getCanManageMessages: () => Promise<boolean>,
): Promise<void> => {
  if (!filter?.words.length) return;
  if (await getCanManageMessages()) return;
  else if (filter.words.some((word) => messageText.toLowerCase().includes(word.toLowerCase())))
    throw new TRPCError({ code: "FORBIDDEN", message: "Message contains blocked content." });
};
