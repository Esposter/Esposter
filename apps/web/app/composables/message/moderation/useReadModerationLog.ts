import type { ReadModerationLogInput } from "#shared/models/db/moderation/ReadModerationLogInput";
import type { RoomInMessage } from "@esposter/db-schema";

import { useModerationLogStore } from "@/store/message/moderation/log";

export const useReadModerationLog = (
  roomId: RoomInMessage["id"],
  filters: MaybeRefOrGetter<Pick<ReadModerationLogInput, "actorUserId" | "targetUserId" | "type">>,
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
