import type { RoomInMessage } from "@esposter/db-schema";

import { useBanStore } from "@/store/message/user/ban";

export const useReadBans = (roomId: RoomInMessage["id"]) => {
  const { $trpc } = useNuxtApp();
  const banStore = useBanStore();
  const { readItems, readMoreItems } = banStore;
  const readBans = () => readItems(() => $trpc.moderation.readBans.query({ roomId }));
  const readMoreBans = (onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.moderation.readBans.query({ cursor, roomId }), onComplete);
  return { readBans, readMoreBans };
};
