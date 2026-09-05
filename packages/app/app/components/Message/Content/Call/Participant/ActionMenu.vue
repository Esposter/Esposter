<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { useCallStore } from "@/store/message/room/call";

interface Props {
  participant: CallParticipant;
}

defineSlots<{ activator: (props: { props: Record<string, unknown> }) => VNode }>();
const { participant } = defineProps<Props>();
const callStore = useCallStore();
const { isInCall } = storeToRefs(callStore);
const { getActions } = useCallParticipantActions();
// `close-on-content-click` is off so dragging the volume slider keeps the menu open;
// Action items close it explicitly instead.
const isOpen = ref(false);
const actions = computed(() =>
  getActions(participant.id, participant.userId, participant.isMuted, participant.isHandRaised),
);
</script>

<template>
  <v-menu v-model="isOpen" :close-on-content-click="false">
    <template #activator="activatorSlotProps">
      <slot name="activator" :="activatorSlotProps" />
    </template>
    <v-list density="compact">
      <MessageContentCallParticipantVolumeSlider v-if="isInCall" :participant-id="participant.id" />
      <v-divider v-if="isInCall && actions.length > 0" />
      <v-list-item
        v-for="{ icon, title, onClick } of actions"
        :key="title"
        :prepend-icon="icon"
        :title
        @click="
          onClick?.($event);
          isOpen = false;
        "
      />
    </v-list>
  </v-menu>
</template>
