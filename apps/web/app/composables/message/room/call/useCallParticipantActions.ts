import type { UnparameterizedAdminActionInput } from "#shared/models/db/moderation/UnparameterizedAdminActionInput";
import type { Item } from "@/models/shared/Item";

import { useCallStore } from "@/store/message/room/call";
import { useParticipantStore } from "@/store/message/room/call/participant";
import { useRoleStore } from "@/store/message/room/role";
import { AdminActionType, RoomPermission } from "@esposter/db-schema";

export const useCallParticipantActions = () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeLowerHandMutation } = useMutation();
  const { executeMutation: executeAdminActionMutation } = useMutation();
  const callStore = useCallStore();
  const { activeCallSessionId, callRoomId } = storeToRefs(callStore);
  const participantStore = useParticipantStore();
  const { setParticipantHandRaised } = participantStore;
  const roleStore = useRoleStore();
  const { checkHasMyPermission } = roleStore;
  const isForceMuteable = computed(() => checkHasMyPermission(callRoomId.value, RoomPermission.MuteMembers));
  const isKickableFromCall = computed(() => checkHasMyPermission(callRoomId.value, RoomPermission.MoveMembers));

  const getActions = (
    participantId: string,
    userId: string,
    isParticipantMuted: boolean,
    isHandRaised: boolean,
  ): Item[] => {
    const roomId = callRoomId.value;
    const callSessionId = activeCallSessionId.value;
    if (!roomId || !callSessionId) return [];

    // The three moderation actions differ only in which `AdminActionType` they send and how they are labelled
    const getAdminActionItem = (type: UnparameterizedAdminActionInput["type"], icon: string, title: string): Item => ({
      icon,
      onClick: async () => {
        await executeAdminActionMutation(
          () => $trpc.message.moderation.executeAdminAction.mutate({ roomId, targetUserId: userId, type }),
          { key: userId },
        );
      },
      title,
    });
    const items: Item[] = [];
    if (isForceMuteable.value && isHandRaised)
      items.push({
        icon: "mdi-hand-back-right-off",
        onClick: async () => {
          await executeLowerHandMutation(
            () =>
              $trpc.callSession.setHandRaised.mutate({
                callSessionId,
                isHandRaised: false,
                participantId,
              }),
            {
              applyOptimistic: () => {
                const previousIsHandRaised =
                  participantStore.callSessionParticipantsMap.get(callSessionId)?.get(participantId)?.isHandRaised ??
                  false;
                setParticipantHandRaised(callSessionId, participantId, false);
                return () => {
                  setParticipantHandRaised(callSessionId, participantId, previousIsHandRaised);
                };
              },
              key: participantId,
            },
          );
        },
        title: "Lower Hand",
      });
    if (isForceMuteable.value)
      items.push(
        isParticipantMuted
          ? getAdminActionItem(AdminActionType.ForceUnmute, "mdi-microphone", "Force Unmute")
          : getAdminActionItem(AdminActionType.ForceMute, "mdi-microphone-off", "Force Mute"),
      );
    if (isKickableFromCall.value)
      items.push(getAdminActionItem(AdminActionType.KickFromCall, "mdi-account-remove", "Kick from Call"));
    return items;
  };

  return { getActions, isForceMuteable, isKickableFromCall };
};
