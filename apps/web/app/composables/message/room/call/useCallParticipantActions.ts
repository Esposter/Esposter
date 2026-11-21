// @unocss-include
import type { UnparameterizedAdminActionInput } from "#shared/models/db/moderation/UnparameterizedAdminActionInput";
import type { Item } from "#src/models/shared/Item";

import { useExecuteAdminAction } from "#src/composables/message/moderation/useExecuteAdminAction";
import { AdminActionIconMap } from "#src/services/message/moderation/AdminActionIconMap";
import { useCallStore } from "#src/store/message/room/call/index";
import { useRoleStore } from "#src/store/message/room/role";
import { AdminActionType, RoomPermission } from "@esposter/db-schema";

export const useCallParticipantActions = () => {
  const callStore = useCallStore();
  const { activeCallSessionId, callRoomId } = storeToRefs(callStore);
  const { setHandRaised } = callStore;
  const executeAdminAction = useExecuteAdminAction(() => callRoomId.value);
  const roleStore = useRoleStore();
  const { checkHasMyPermission } = roleStore;
  const isForceMuteable = computed(() => checkHasMyPermission(callRoomId.value, RoomPermission.MuteMembers));
  const isKickableFromCall = computed(() => checkHasMyPermission(callRoomId.value, RoomPermission.MoveMembers));

  const getActions = (participantId: string, userId: string, isParticipantMuted: boolean, isHandRaised: boolean) => {
    const roomId = callRoomId.value;
    const callSessionId = activeCallSessionId.value;
    if (!roomId || !callSessionId) return [];
    // The three moderation actions differ only in which `AdminActionType` they send and how they are labelled
    const getAdminActionItem = (
      type: UnparameterizedAdminActionInput["type"],
      icon: string,
      title: string,
    ): Extract<Item, { icon: string }> => ({
      icon,
      onClick: async () => {
        // The server decides what a moderation action does to the target, so the item waits on its answer. The target's row
        // Changes through the call's own events, so the answer carries no row and nothing is shown before it
        await executeAdminAction((actionRoomId) => ({ roomId: actionRoomId, targetUserId: userId, type }));
      },
      title,
    });
    const items: Extract<Item, { icon: string }>[] = [];
    if (isForceMuteable.value && isHandRaised)
      items.push({
        icon: "i-mdi:hand-back-right-off",
        onClick: () => {
          setHandRaised(false, participantId);
        },
        title: "Lower Hand",
      });
    if (isForceMuteable.value)
      items.push(
        isParticipantMuted
          ? getAdminActionItem(
              AdminActionType.ForceUnmute,
              AdminActionIconMap[AdminActionType.ForceUnmute],
              "Force Unmute",
            )
          : getAdminActionItem(AdminActionType.ForceMute, AdminActionIconMap[AdminActionType.ForceMute], "Force Mute"),
      );
    if (isKickableFromCall.value)
      items.push(
        getAdminActionItem(
          AdminActionType.KickFromCall,
          AdminActionIconMap[AdminActionType.KickFromCall],
          "Kick from Call",
        ),
      );
    return items;
  };

  return { getActions, isForceMuteable, isKickableFromCall };
};
