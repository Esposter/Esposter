import type { Item } from "@/models/shared/Item";

import { hasPermission } from "#shared/services/room/rbac/hasPermission";
import { useCallStore } from "@/store/message/room/call";
import { useRoleStore } from "@/store/message/room/role";
import { AdminActionType, RoomPermission } from "@esposter/db-schema";

export const useCallParticipantActions = () => {
  const { $trpc } = useNuxtApp();
  const callStore = useCallStore();
  const { callRoomId } = storeToRefs(callStore);
  const roleStore = useRoleStore();
  const { getMyPermissions } = roleStore;
  const myPermissions = computed(() => (callRoomId.value ? getMyPermissions(callRoomId.value) : undefined));
  const isForceMuteable = computed(() => {
    if (!myPermissions.value) return false;
    return hasPermission(myPermissions.value.permissions, RoomPermission.MuteMembers, myPermissions.value.isRoomOwner);
  });
  const isKickableFromCall = computed(() => {
    if (!myPermissions.value) return false;
    return hasPermission(myPermissions.value.permissions, RoomPermission.MoveMembers, myPermissions.value.isRoomOwner);
  });

  const getActions = (userId: string, participantIsMuted: boolean): Item[] => {
    const roomId = callRoomId.value;
    if (!roomId) return [];
    const items: Item[] = [];
    if (isForceMuteable.value && !participantIsMuted)
      items.push({
        icon: "mdi-microphone-off",
        onClick: async () => {
          await $trpc.moderation.executeAdminAction.mutate({
            roomId,
            targetUserId: userId,
            type: AdminActionType.ForceMute,
          });
        },
        title: "Force Mute",
      });
    if (isForceMuteable.value && participantIsMuted)
      items.push({
        icon: "mdi-microphone",
        onClick: async () => {
          await $trpc.moderation.executeAdminAction.mutate({
            roomId,
            targetUserId: userId,
            type: AdminActionType.ForceUnmute,
          });
        },
        title: "Force Unmute",
      });
    if (isKickableFromCall.value)
      items.push({
        icon: "mdi-account-remove",
        onClick: async () => {
          await $trpc.moderation.executeAdminAction.mutate({
            roomId,
            targetUserId: userId,
            type: AdminActionType.KickFromCall,
          });
        },
        title: "Kick from Call",
      });
    return items;
  };

  return { getActions, isForceMuteable, isKickableFromCall };
};
