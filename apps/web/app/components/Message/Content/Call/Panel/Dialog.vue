<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isCallViewOpen } = storeToRefs(callStore);
</script>

<template>
  <v-dialog v-model="isCallViewOpen" fullscreen :scrim="false">
    <MessageContentCallView>
      <template #append>
        <StyledTooltipIconButton
          icon="mdi-close"
          text="Close call view"
          :tooltip-props="{ location: 'bottom' }"
          @click="isCallViewOpen = false"
        />
      </template>
    </MessageContentCallView>
  </v-dialog>
</template>
