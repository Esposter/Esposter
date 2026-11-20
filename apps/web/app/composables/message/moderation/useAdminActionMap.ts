import type { AdminAction } from "#src/models/message/moderation/AdminAction";

import { pluralize } from "#shared/util/text/pluralize";
import { AdminActionHookMap } from "#src/services/message/moderation/AdminActionHookMap";
import { useAlertStore } from "#src/store/alert";
import { AdminActionType, AdminActionTypes } from "@esposter/db-schema";

export const useAdminActionMap = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const adminActionMap: Partial<Record<AdminActionType, AdminAction>> = {
    // A removal is the tombstone of the target's membership, which reaches the target's tabs with the removal itself
    [AdminActionType.CreateBan]: () => {
      createAlert("You have been banned from this room.", "error");
    },
    [AdminActionType.KickFromCall]: () => {
      createAlert("You have been kicked from the call.", "error");
    },
    [AdminActionType.KickFromRoom]: () => {
      createAlert("You have been kicked from this room.", "error");
    },
    [AdminActionType.SoftBan]: () => {
      createAlert("You have been soft-banned from this room.", "error");
    },
    [AdminActionType.StopScreenShare]: () => {
      createAlert("Your screen share has been stopped by a moderator.", "error");
    },
    [AdminActionType.TimeoutUser]: (_roomId: string, durationMs?: number) => {
      const minutes = durationMs
        ? Math.max(1, Math.ceil(Temporal.Duration.from({ milliseconds: durationMs }).total("minutes")))
        : 0;
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
