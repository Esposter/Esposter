import type { Item } from "@/models/shared/Item";

import { hasPermission } from "#shared/services/room/rbac/hasPermission";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useRoleStore } from "@/store/message/room/role";
import { useVoiceStore } from "@/store/message/room/voice";
import { AdminActionType, RoomPermission } from "@esposter/db-schema";

export const useVoiceParticipantActions = () => {
  const { $trpc } = useNuxtApp();
  const voiceStore = useVoiceStore();
  const { callRoomId } = storeToRefs(voiceStore);
  const roleStore = useRoleStore();
  const { getMyPermissions } = roleStore;

  const myPermissions = computed(() => (callRoomId.value ? getMyPermissions(callRoomId.value) : undefined));
  const isForceMuteable = computed(() => {
    if (!myPermissions.value) return false;
    return hasPermission(myPermissions.value.permissions, RoomPermission.MuteMembers, myPermissions.value.isRoomOwner);
  });
  const isKickableFromVoice = computed(() => {
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
        onClick: getSynchronizedFunction(async () => {
          await $trpc.moderation.executeAdminAction.mutate({
            roomId,
            targetUserId: userId,
            type: AdminActionType.ForceMute,
          });
        }),
        title: "Force Mute",
      });
    if (isForceMuteable.value && participantIsMuted)
      items.push({
        icon: "mdi-microphone",
        onClick: getSynchronizedFunction(async () => {
          await $trpc.moderation.executeAdminAction.mutate({
            roomId,
            targetUserId: userId,
            type: AdminActionType.ForceUnmute,
          });
        }),
        title: "Force Unmute",
      });
    if (isKickableFromVoice.value)
      items.push({
        icon: "mdi-account-remove",
        onClick: getSynchronizedFunction(async () => {
          await $trpc.moderation.executeAdminAction.mutate({
            roomId,
            targetUserId: userId,
            type: AdminActionType.KickFromVoice,
          });
        }),
        title: "Kick from Voice",
      });
    return items;
  };

  return { getActions, isForceMuteable, isKickableFromVoice };
};
