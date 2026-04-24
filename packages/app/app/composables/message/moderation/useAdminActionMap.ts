import type { Promisable } from "type-fest";

import { AdminActionHookMap } from "@/services/message/moderation/AdminActionHookMap";
import { useRoomStore } from "@/store/message/room";
import { AdminActionType } from "@esposter/db-schema";

type Action = (roomId: string, durationMs?: number) => Promisable<void>;

export const useAdminActionMap = () => {
  const { notify } = useAdminActionNotification();
  const roomStore = useRoomStore();
  const { storeDeleteRoom } = roomStore;
  const adminActionMap: Partial<Record<AdminActionType, Action>> = {
    [AdminActionType.CreateBan]: async (roomId: string) => {
      await storeDeleteRoom({ id: roomId });
      notify("You have been banned from this room.");
    },
    [AdminActionType.KickFromRoom]: async (roomId: string) => {
      await storeDeleteRoom({ id: roomId });
      notify("You have been kicked from this room.");
    },
    [AdminActionType.KickFromVoice]: () => {
      notify("You have been kicked from voice.");
    },
    [AdminActionType.TimeoutUser]: (_roomId: string, durationMs?: number) => {
      const minutes = durationMs ? Math.max(1, Math.ceil(durationMs / 60000)) : 0;
      notify(`You have been timed out for ${minutes} minute${minutes === 1 ? "" : "s"}.`);
    },
  };
  return Object.fromEntries(
    Object.values(AdminActionType).map((adminActionType) => [
      adminActionType,
      async (roomId: string, durationMs?: number) => {
        await Promise.all(AdminActionHookMap[adminActionType].map((fn) => Promise.resolve(fn(roomId))));
        await adminActionMap[adminActionType]?.(roomId, durationMs);
      },
    ]),
  );
};
