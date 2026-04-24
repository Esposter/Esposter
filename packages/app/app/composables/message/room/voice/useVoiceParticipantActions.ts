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
  const { getMyPermissionsMap } = roleStore;

  const voicePermissionsData = computed(() => (callRoomId.value ? getMyPermissionsMap(callRoomId.value) : undefined));
  const canForceMute = computed(() => {
    const data = voicePermissionsData.value;
    if (!data) return false;
    return hasPermission(data.permissions, RoomPermission.MuteMembers, data.isRoomOwner);
  });
  const canKickFromVoice = computed(() => {
    const data = voicePermissionsData.value;
    if (!data) return false;
    return hasPermission(data.permissions, RoomPermission.MoveMembers, data.isRoomOwner);
  });

  const getActions = (userId: string, participantIsMuted: boolean): Item[] => {
    const roomId = callRoomId.value;
    if (!roomId) return [];
    const items: Item[] = [];
    if (canForceMute.value && !participantIsMuted)
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
    if (canForceMute.value && participantIsMuted)
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
    if (canKickFromVoice.value)
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

  return { canForceMute, canKickFromVoice, getActions };
};
