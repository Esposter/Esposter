import type { readModerationLogInputSchema } from "#shared/models/db/moderation/ReadModerationLogInput";
import type { RoomInMessage } from "@esposter/db-schema";
import type { z } from "zod";

import { useModerationLogStore } from "@/store/message/moderation/log";

// The filters as the client holds them: an unset one is "" and the router reads it as absent
export const useReadModerationLog = (
  roomId: RoomInMessage["id"],
  filters: MaybeRefOrGetter<
    Pick<z.input<typeof readModerationLogInputSchema>, "actorUserId" | "targetUserId" | "type">
  >,
) => {
  const { $trpc } = useNuxtApp();
  const moderationLogStore = useModerationLogStore();
  const { readItems, readMoreItems } = moderationLogStore;
  const readModerationLog = () =>
    readItems(() => $trpc.message.moderation.readModerationLog.query({ roomId, ...toValue(filters) }));
  const readMoreModerationLog = (onComplete: () => void) => {
    // Taken as the read is issued, so a retry after the filters changed still asks for the log their cursor came from
    const issuedFilters = toValue(filters);
    return readMoreItems(
      (cursor) => $trpc.message.moderation.readModerationLog.query({ cursor, roomId, ...issuedFilters }),
      onComplete,
    );
  };
  return { readModerationLog, readMoreModerationLog };
};
