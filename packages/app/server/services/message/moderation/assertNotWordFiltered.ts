import type { RoomFilterInMessage } from "@esposter/db-schema";

import { TRPCError } from "@trpc/server";

export const assertNotWordFiltered = async (
  filter: Pick<RoomFilterInMessage, "words"> | undefined,
  messageText: string,
  getCanManageMessages: () => Promise<boolean>,
): Promise<void> => {
  if (!filter?.words.length) return;

  const normalizedMessageText = messageText.toLowerCase();
  if (!filter.words.some((word) => normalizedMessageText.includes(word.toLowerCase()))) return;
  else if (await getCanManageMessages()) return;
  else throw new TRPCError({ code: "FORBIDDEN", message: "Message contains blocked content." });
};
