<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { authClient } from "@/services/auth/authClient";

interface MessageContentCallParticipantBarAvatarProps {
  isHandRaised: boolean;
  isSpeaking: boolean;
  participant: CallParticipant;
}

const { isHandRaised, isSpeaking, participant } = defineProps<MessageContentCallParticipantBarAvatarProps>();
const { data: session } = await authClient.useSession(useFetch);
const { getActions, isForceMuteable, isKickableFromCall } = useCallParticipantActions();
const isActionable = computed(
  () => participant.userId !== session.value?.user.id && (isForceMuteable.value || isKickableFromCall.value),
);
const avatarProps = computed(() => ({
  avatarProps: { size: "1.75rem" },
  image: participant.image,
  name: participant.name,
}));
</script>

<template>
  <div relative>
    <v-menu v-if="isActionable">
      <template #activator="{ props: menuProps }">
        <StyledAvatar cursor-pointer :="{ ...avatarProps, ...menuProps }" />
      </template>
      <v-list density="compact">
        <v-list-item
          v-for="{ icon, title, onClick } of getActions(
            participant.id,
            participant.userId,
            participant.isMuted,
            isHandRaised,
          )"
          :key="title"
          :prepend-icon="icon"
          :title
          @click="onClick"
        />
      </v-list>
    </v-menu>
    <StyledAvatar v-else :="avatarProps" />
    <div
      v-if="isHandRaised"
      bg-warning
      text-black
      rd-full
      flex
      size-4
      items-center
      right--1
      top--1
      justify-center
      absolute
    >
      <v-icon icon="mdi-hand-back-right" size="x-small" />
    </div>
    <div
      v-if="isSpeaking"
      inset="-0.1875rem"
      rd-full
      pointer-events-none
      absolute
      shadow="[0_0_0_2px_rgb(var(--v-theme-primary)),0_0_8px_4px_rgba(var(--v-theme-primary),0.4)]"
    />
  </div>
</template>
