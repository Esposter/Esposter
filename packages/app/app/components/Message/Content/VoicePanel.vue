<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useVoiceStore } from "@/store/message/room/voice";

const voiceStore = useVoiceStore();
const { isDeafened, isInChannel, roomParticipants, speakingIds } = storeToRefs(voiceStore);
const { data: session } = await authClient.useSession(useFetch);
const { canForceMute, canKickFromVoice, getActions } = useVoiceParticipantActions();
const voiceControlItems = useVoiceControlItems();
</script>

<template>
  <TransitionFade>
    <div v-if="isInChannel" class="bg-surface-variant" border-b flex items-center gap-x-3 px-4 py-2>
      <v-icon icon="mdi-volume-high" size="small" color="success" />
      <span text-sm font-medium flex-1>Voice</span>
      <div flex items-center gap-x-1>
        <div v-for="{ id, image, isMuted: participantIsMuted, name, userId } of roomParticipants" :key="id" relative>
          <v-menu
            v-if="userId !== session?.user.id && (canForceMute || canKickFromVoice)"
            :close-on-content-click="true"
          >
            <template #activator="{ props: menuProps }">
              <StyledAvatar size="x-small" :image :name :="menuProps" cursor-pointer />
            </template>
            <v-list density="compact">
              <v-list-item
                v-for="{ icon, title, onClick } of getActions(userId, participantIsMuted)"
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
            absolute
            inset-0
            animate-pulse
            outline="2 solid green-500 offset-1"
            pointer-events-none
            rd-full
          />
          <v-icon v-if="participantIsMuted" icon="mdi-microphone-off" size="x-small" absolute bottom-0 right-0 />
          <v-icon
            v-if="isDeafened && id === session?.session.id"
            icon="mdi-headphones-off"
            size="x-small"
            absolute
            bottom-0
            left-0
          />
        </div>
      </div>
      <v-tooltip
        v-for="{ tooltip, icon, color, variant, onClick } of voiceControlItems"
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
