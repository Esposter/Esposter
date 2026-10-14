import type { AdminActionType, RoomInMessage } from "@esposter/db-schema";

import { useModerationLogStore } from "@/store/message/moderation/log";

// The filters as the client holds them: an unset one is "" and the router reads it as absent
export const useReadModerationLog = (
  roomId: RoomInMessage["id"],
  filters: MaybeRefOrGetter<{ actorUserId: string; targetUserId: string; type: "" | AdminActionType }>,
) => {
  const { $trpc } = useNuxtApp();
  const moderationLogStore = useModerationLogStore();
  const { readItems, readMoreItems } = moderationLogStore;
  const readModerationLog = () =>
    readItems(() => $trpc.message.moderation.readModerationLog.query({ roomId, ...toValue(filters) }));
  const readMoreModerationLog = (onComplete: () => void) =>
    readMoreItems(
      (cursor) => $trpc.message.moderation.readModerationLog.query({ cursor, roomId, ...toValue(filters) }),
      onComplete,
    );
  return { readModerationLog, readMoreModerationLog };
};
