<script setup lang="ts">
import { hasPermission } from "#shared/services/room/rbac/hasPermission";
import { authClient } from "@/services/auth/authClient";
import { useRoleStore } from "@/store/message/room/role";
import { useVoiceStore } from "@/store/message/room/voice";
import { AdminActionType, RoomPermission } from "@esposter/db-schema";

const { $trpc } = useNuxtApp();
const voiceStore = useVoiceStore();
const { leaveVoice, toggleDeafen, toggleMute } = voiceStore;
const { callRoomId, isDeafened, isInChannel, isMuted, roomParticipants, speakingIds } = storeToRefs(voiceStore);
const { data: session } = await authClient.useSession(useFetch);
const sessionId = computed(() => session.value?.session.id);
const sessionUserId = computed(() => session.value?.user.id);
const roleStore = useRoleStore();
const { myPermissionsMap } = storeToRefs(roleStore);
const voicePermissionsData = computed(() =>
  callRoomId.value ? myPermissionsMap.value.get(callRoomId.value) : undefined,
);
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
</script>

<template>
  <TransitionFade>
    <div v-if="isInChannel" class="bg-surface-variant" border-b flex items-center gap-x-3 px-4 py-2>
      <v-icon icon="mdi-volume-high" size="small" color="success" />
      <span text-sm font-medium flex-1>Voice</span>
      <div flex items-center gap-x-1>
        <div v-for="{ id, image, isMuted: participantIsMuted, name, userId } of roomParticipants" :key="id" relative>
          <v-menu v-if="userId !== sessionUserId && (canForceMute || canKickFromVoice)" :close-on-content-click="true">
            <template #activator="{ props: menuProps }">
              <StyledAvatar size="x-small" :image :name :="menuProps" cursor-pointer />
            </template>
            <v-list density="compact">
              <v-list-item
                v-if="canForceMute && !participantIsMuted"
                prepend-icon="mdi-microphone-off"
                title="Force Mute"
                @click="
                  callRoomId &&
                  $trpc.moderation.executeAdminAction.mutate({
                    roomId: callRoomId,
                    targetUserId: userId,
                    type: AdminActionType.ForceMute,
                  })
                "
              />
              <v-list-item
                v-if="canForceMute && participantIsMuted"
                prepend-icon="mdi-microphone"
                title="Force Unmute"
                @click="
                  callRoomId &&
                  $trpc.moderation.executeAdminAction.mutate({
                    roomId: callRoomId,
                    targetUserId: userId,
                    type: AdminActionType.ForceUnmute,
                  })
                "
              />
              <v-list-item
                v-if="canKickFromVoice"
                prepend-icon="mdi-account-remove"
                title="Kick from Voice"
                @click="
                  callRoomId &&
                  $trpc.moderation.executeAdminAction.mutate({
                    roomId: callRoomId,
                    targetUserId: userId,
                    type: AdminActionType.KickFromVoice,
                  })
                "
              />
            </v-list>
          </v-menu>
          <StyledAvatar v-else size="x-small" :image :name />
          <div
            v-if="speakingIds.includes(id)"
            absolute
            inset-0
            animate-pulse
            outline="2 solid green-500 offset-1"
            pointer-events-none
            rd-full
          />
          <v-icon v-if="participantIsMuted" icon="mdi-microphone-off" size="x-small" absolute bottom-0 right-0 />
          <v-icon
            v-if="isDeafened && id === sessionId"
            icon="mdi-headphones-off"
            size="x-small"
            absolute
            bottom-0
            left-0
          />
        </div>
      </div>
      <v-tooltip :text="isMuted ? 'Unmute' : 'Mute'" location="bottom">
        <template #activator="{ props }">
          <v-btn
            :="props"
            :icon="isMuted ? 'mdi-microphone-off' : 'mdi-microphone'"
            :color="isMuted ? 'error' : undefined"
            size="x-small"
            variant="plain"
            :ripple="false"
            @click="toggleMute()"
          />
        </template>
      </v-tooltip>
      <v-tooltip :text="isDeafened ? 'Undeafen' : 'Deafen'" location="bottom">
        <template #activator="{ props }">
          <v-btn
            :="props"
            :icon="isDeafened ? 'mdi-headphones-off' : 'mdi-headphones'"
            :color="isDeafened ? 'error' : undefined"
            size="x-small"
            variant="plain"
            :ripple="false"
            @click="toggleDeafen()"
          />
        </template>
      </v-tooltip>
      <v-tooltip text="Leave Voice" location="bottom">
        <template #activator="{ props }">
          <v-btn
            :="props"
            icon="mdi-phone-hangup"
            color="error"
            size="x-small"
            variant="tonal"
            :ripple="false"
            @click="leaveVoice()"
          />
        </template>
      </v-tooltip>
    </div>
  </TransitionFade>
</template>
