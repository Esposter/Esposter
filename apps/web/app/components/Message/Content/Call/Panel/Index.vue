<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isCallViewOpen, isInCall } = storeToRefs(callStore);
</script>

<!-- The call view opens over the room's content in place, as a voice channel's does, rather than as a modal: a call is
     somewhere the reader is, not something that interrupts them, so the dock and the room list stay beside it -->
<template>
  <MessageContentCallPanelBar v-if="isInCall" />
  <Transition name="call-view">
    <div v-if="isCallViewOpen" inset-0 absolute z-1>
      <MessageContentCallView>
        <template #append>
          <UiIconButton label="Close call view" :meaning="UiIconMeaning.Collapse" @click="isCallViewOpen = false" />
        </template>
      </MessageContentCallView>
    </div>
  </Transition>
</template>

<style scoped>
.call-view-enter-active {
  transition:
    opacity var(--ui-motion-medium),
    transform var(--ui-motion-medium);
}

.call-view-leave-active {
  transition:
    opacity var(--ui-motion-short),
    transform var(--ui-motion-short);
}

.call-view-enter-from,
.call-view-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
