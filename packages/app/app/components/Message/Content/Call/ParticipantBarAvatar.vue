<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { authClient } from "@/services/auth/authClient";

interface MessageContentCallParticipantBarAvatarProps {
  isSpeaking: boolean;
  participant: CallParticipant;
}

const { isSpeaking, participant } = defineProps<MessageContentCallParticipantBarAvatarProps>();
const { data: session } = await authClient.useSession(useFetch);
const { getActions, isForceMuteable, isKickableFromCall } = useCallParticipantActions();
const isActionable = computed(
  () => participant.userId !== session.value?.user.id && (isForceMuteable.value || isKickableFromCall.value),
);
</script>

<template>
  <div relative>
    <v-menu v-if="isActionable">
      <template #activator="{ props: menuProps }">
        <StyledAvatar
          cursor-pointer
          :avatar-props="{ size: '1.75rem' }"
          :image="participant.image"
          :name="participant.name"
          :="menuProps"
        />
      </template>
      <v-list density="compact">
        <v-list-item
          v-for="{ icon, title, onClick } of getActions(participant.userId, participant.isMuted)"
          :key="title"
          :prepend-icon="icon"
          :title
          @click="onClick"
        />
      </v-list>
    </v-menu>
    <StyledAvatar v-else :avatar-props="{ size: '1.75rem' }" :image="participant.image" :name="participant.name" />
    <div
      v-if="isSpeaking"
      inset="-0.1875rem"
      b-2
      b-primary
      rd-full
      b-solid
      pointer-events-none
      absolute
      animate-pulse
    />
  </div>
</template>
