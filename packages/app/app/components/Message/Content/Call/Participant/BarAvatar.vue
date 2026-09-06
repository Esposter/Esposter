<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { authClient } from "@/services/auth/authClient";
import { useCallStore } from "@/store/message/room/call";

interface Props {
  isSpeaking: boolean;
  participant: CallParticipant;
}

const { isSpeaking, participant } = defineProps<Props>();
const { data: session } = await authClient.useSession(useFetch);
const callStore = useCallStore();
const { isInCall } = storeToRefs(callStore);
const { isForceMuteable, isKickableFromCall } = useCallParticipantActions();
const isActionable = computed(
  () =>
    participant.userId !== session.value?.user.id &&
    (isInCall.value || isForceMuteable.value || isKickableFromCall.value),
);
const avatarProps = computed(() => ({
  avatarProps: { size: "1.75rem" },
  image: participant.image,
  name: participant.name,
}));
</script>

<template>
  <div relative>
    <MessageContentCallParticipantActionMenu v-if="isActionable" :participant>
      <template #activator="{ props: menuProps }">
        <StyledAvatar cursor-pointer :="{ ...avatarProps, ...menuProps }" />
      </template>
    </MessageContentCallParticipantActionMenu>
    <StyledAvatar v-else :="avatarProps" />
    <!-- `warning` is Vuetify's colour rather than one this theme registers, so no utility for it generates at
      All — the badge takes it through the `color` prop, which is how the rest of the app already reaches it -->
    <v-avatar v-if="participant.isHandRaised" color="warning" size="1rem" text-black right--1 top--1 absolute>
      <v-icon icon="mdi-hand-back-right" size="x-small" />
    </v-avatar>
    <div
      v-if="isSpeaking"
      inset="-0.1875rem"
      rd-full
      pointer-events-none
      absolute
      shadow="[0_0_0_0.125rem_rgb(var(--v-theme-primary)),0_0_0.5rem_0.25rem_rgba(var(--v-theme-primary),0.4)]"
    />
  </div>
</template>
