<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
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
</script>

<template>
  <MessageContentCallParticipantActionMenu v-if="isActionable" :participant :variant="UiButtonVariant.Quiet">
    <template #trigger>
      <MessageContentCallParticipantAvatar :is-speaking :participant />
    </template>
  </MessageContentCallParticipantActionMenu>
  <MessageContentCallParticipantAvatar v-else :is-speaking :participant />
</template>
