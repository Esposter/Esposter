import type { Promisable } from "type-fest";

import { dayjs } from "#shared/services/dayjs";
import { pluralize } from "#shared/util/text/pluralize";
import { AdminActionHookMap } from "@/services/message/moderation/AdminActionHookMap";
import { useAlertStore } from "@/store/alert";
import { useRoomStore } from "@/store/message/room";
import { AdminActionType, AdminActionTypes } from "@esposter/db-schema";

type Action = (roomId: string, durationMs?: number) => Promisable<void>;

export const useAdminActionMap = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const roomStore = useRoomStore();
  const { storeDeleteRoom } = roomStore;
  const adminActionMap: Partial<Record<AdminActionType, Action>> = {
    [AdminActionType.CreateBan]: async (roomId: string) => {
      await storeDeleteRoom({ id: roomId });
      createAlert("You have been banned from this room.", "error");
    },
    [AdminActionType.KickFromCall]: () => {
      createAlert("You have been kicked from the call.", "error");
    },
    [AdminActionType.KickFromRoom]: async (roomId: string) => {
      await storeDeleteRoom({ id: roomId });
      createAlert("You have been kicked from this room.", "error");
    },
    [AdminActionType.SoftBan]: async (roomId: string) => {
      await storeDeleteRoom({ id: roomId });
      createAlert("You have been soft-banned from this room.", "error");
    },
    [AdminActionType.StopScreenShare]: () => {
      createAlert("Your screen share has been stopped by a moderator.", "error");
    },
    [AdminActionType.TimeoutUser]: (_roomId: string, durationMs?: number) => {
      const minutes = durationMs ? Math.max(1, Math.ceil(dayjs.duration(durationMs).asMinutes())) : 0;
      createAlert(`You have been timed out for ${minutes} ${pluralize("minute", minutes)}.`, "error");
    },
    [AdminActionType.Warn]: () => {
      createAlert("You have been warned.", "error");
    },
  };
  return Object.fromEntries(
    AdminActionTypes.map((adminActionType) => [
      adminActionType,
      async (roomId: string, durationMs?: number) => {
        await AdminActionHookMap[adminActionType].run(roomId);
        await adminActionMap[adminActionType]?.(roomId, durationMs);
      },
    ]),
  );
};
