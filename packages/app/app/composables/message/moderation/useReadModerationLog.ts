import type { RoomInMessage } from "@esposter/db-schema";

import { useModerationLogStore } from "@/store/message/moderation/log";

export const useReadModerationLog = (roomId: RoomInMessage["id"]) => {
  const { $trpc } = useNuxtApp();
  const moderationLogStore = useModerationLogStore();
  const { readItems, readMoreItems } = moderationLogStore;
  const readModerationLog = () => readItems(() => $trpc.moderation.readModerationLog.query({ roomId }));
  const readMoreModerationLog = (onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.moderation.readModerationLog.query({ cursor, roomId }), onComplete);
  return { readModerationLog, readMoreModerationLog };
};
