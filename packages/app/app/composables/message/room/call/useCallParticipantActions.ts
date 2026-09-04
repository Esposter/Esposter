import type { Item } from "@/models/shared/Item";

import { useCallStore } from "@/store/message/room/call";
import { useParticipantStore } from "@/store/message/room/call/participant";
import { useRoleStore } from "@/store/message/room/role";
import { AdminActionType, checkHasPermission, RoomPermission } from "@esposter/db-schema";

export const useCallParticipantActions = () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeLowerHandMutation } = useMutation();
  const { executeMutation: executeAdminActionMutation } = useMutation();
  const callStore = useCallStore();
  const { activeCallSessionId, callRoomId } = storeToRefs(callStore);
  const participantStore = useParticipantStore();
  const { setParticipantHandRaised } = participantStore;
  const roleStore = useRoleStore();
  const { getMyPermissions } = roleStore;
  const myPermissions = computed(() => (callRoomId.value ? getMyPermissions(callRoomId.value) : undefined));
  const isForceMuteable = computed(() => {
    if (!myPermissions.value) return false;
    return checkHasPermission(
      myPermissions.value.permissions,
      RoomPermission.MuteMembers,
      myPermissions.value.isRoomOwner,
    );
  });
  const isKickableFromCall = computed(() => {
    if (!myPermissions.value) return false;
    return checkHasPermission(
      myPermissions.value.permissions,
      RoomPermission.MoveMembers,
      myPermissions.value.isRoomOwner,
    );
  });

  const getActions = (
    participantId: string,
    userId: string,
    isParticipantMuted: boolean,
    isHandRaised: boolean,
  ): Item[] => {
    const roomId = callRoomId.value;
    const callSessionId = activeCallSessionId.value;
    if (!roomId || !callSessionId) return [];
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
    if (isForceMuteable.value && !isParticipantMuted)
      items.push({
        icon: "mdi-microphone-off",
        onClick: async () => {
          await executeAdminActionMutation(
            () =>
              $trpc.message.moderation.executeAdminAction.mutate({
                roomId,
                targetUserId: userId,
                type: AdminActionType.ForceMute,
              }),
            { key: userId },
          );
        },
        title: "Force Mute",
      });
    if (isForceMuteable.value && isParticipantMuted)
      items.push({
        icon: "mdi-microphone",
        onClick: async () => {
          await executeAdminActionMutation(
            () =>
              $trpc.message.moderation.executeAdminAction.mutate({
                roomId,
                targetUserId: userId,
                type: AdminActionType.ForceUnmute,
              }),
            { key: userId },
          );
        },
        title: "Force Unmute",
      });
    if (isKickableFromCall.value)
      items.push({
        icon: "mdi-account-remove",
        onClick: async () => {
          await executeAdminActionMutation(
            () =>
              $trpc.message.moderation.executeAdminAction.mutate({
                roomId,
                targetUserId: userId,
                type: AdminActionType.KickFromCall,
              }),
            { key: userId },
          );
        },
        title: "Kick from Call",
      });
    return items;
  };

  return { getActions, isForceMuteable, isKickableFromCall };
};
