import type { readModerationLogInputSchema } from "#shared/models/db/moderation/ReadModerationLogInput";
import type { RoomInMessage } from "@esposter/db-schema";
import type { z } from "zod";

import { useRunScope } from "#src/composables/shared/useRunScope";
import { useModerationLogStore } from "#src/store/message/moderation/log";

// The filters as the client holds them: an unset one is "" and the router reads it as absent
export const useReadModerationLog = (
  roomId: RoomInMessage["id"],
  filters: () => Pick<z.input<typeof readModerationLogInputSchema>, "actorUserId" | "targetUserId" | "type">,
) => {
  const { $trpc } = useNuxtApp();
  const moderationLogStore = useModerationLogStore();
  const { readItems, readMoreItems } = moderationLogStore;
  // The state of the latest read, held here rather than read off each call's own refs: a filter read is issued after
  // The First one, so a list bound to the first call's refs would never see the filter read in flight or failed
  const isError = ref(false);
  const isPending = ref(false);
  // Only the newest read commits the state, so a read a newer one overtook cannot clear the pending state or set
  // The error while that newer read is still out
  const runScope = useRunScope();
  const readModerationLog = () => {
    isPending.value = true;
    return runScope.run(
      () => readItems(() => $trpc.message.moderation.readModerationLog.query({ roomId, ...filters() })),
      (read) => {
        isError.value = read.isError.value;
        isPending.value = false;
      },
    );
  };
  const readMoreModerationLog = (onComplete: () => void) => {
    // Taken as the read is issued, so a retry after the filters changed still asks for the log their cursor came from
    const issuedFilters = filters();
    return readMoreItems(
      (cursor) => $trpc.message.moderation.readModerationLog.query({ cursor, roomId, ...issuedFilters }),
      onComplete,
    );
  };
  return { isError, isPending, readModerationLog, readMoreModerationLog };
};
