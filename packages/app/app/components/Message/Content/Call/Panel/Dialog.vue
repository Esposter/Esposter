<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isCallViewOpen } = storeToRefs(callStore);
</script>

<template>
  <v-dialog v-model="isCallViewOpen" fullscreen :scrim="false">
    <div size-screen relative>
      <MessageContentCallView />
      <v-tooltip location="bottom" text="Close call view">
        <template #activator="{ props }">
          <v-btn :="props" icon="mdi-close" right-4 top-4 absolute @click="isCallViewOpen = false" />
        </template>
      </v-tooltip>
    </div>
  </v-dialog>
</template>
