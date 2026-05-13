<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isDeafened, isInCall, roomParticipants, speakingIds } = storeToRefs(callStore);
const { data: session } = await authClient.useSession(useFetch);
const { getActions, isForceMuteable, isKickableFromCall } = useCallParticipantActions();
const callControlItems = useCallControlItems();
</script>

<template>
  <TransitionFade>
    <div v-if="isInCall" bg-surface-variant px-4 py-2 border-b flex gap-x-3 items-center>
      <v-icon icon="mdi-volume-high" size="small" color="success" />
      <span text-sm font-medium flex-1>Call</span>
      <div flex gap-x-1 items-center>
        <div
          v-for="{ id, image, isCameraEnabled, isMuted: isParticipantMuted, name, userId } of roomParticipants"
          :key="id"
          relative
        >
          <v-menu v-if="userId !== session?.user.id && (isForceMuteable || isKickableFromCall)">
            <template #activator="{ props: menuProps }">
              <StyledAvatar size="x-small" :image :name :="menuProps" cursor-pointer />
            </template>
            <v-list density="compact">
              <v-list-item
                v-for="{ icon, title, onClick } of getActions(userId, isParticipantMuted)"
                :key="title"
                :prepend-icon="icon"
                :title
                @click="onClick"
              />
            </v-list>
          </v-menu>
          <StyledAvatar v-else size="x-small" :image :name />
          <div
            v-if="speakingIds.includes(id)"
            outline="2 solid green-500 offset-1"
            rd-full
            pointer-events-none
            inset-0
            absolute
            animate-pulse
          />
          <v-icon v-if="isParticipantMuted" icon="mdi-microphone-off" size="x-small" bottom-0 right-0 absolute />
          <v-icon v-if="isCameraEnabled" icon="mdi-video" size="x-small" right-0 top-0 absolute />
          <v-icon
            v-if="isDeafened && id === session?.session.id"
            icon="mdi-headphones-off"
            size="x-small"
            bottom-0
            left-0
            absolute
          />
        </div>
      </div>
      <v-tooltip
        v-for="{ tooltip, icon, color, variant, onClick } of callControlItems"
        :key="tooltip"
        :text="tooltip"
        location="bottom"
      >
        <template #activator="{ props }">
          <v-btn :="props" :icon :color size="x-small" :variant :ripple="false" @click="onClick" />
        </template>
      </v-tooltip>
    </div>
  </TransitionFade>
</template>
