<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isCallViewOpen } = storeToRefs(callStore);
</script>

<template>
  <v-dialog v-model="isCallViewOpen" fullscreen :scrim="false">
    <MessageContentCallView>
      <template #append>
        <v-tooltip location="bottom" text="Close call view">
          <template #activator="{ props }">
            <v-btn :="props" icon="mdi-close" @click="isCallViewOpen = false" />
          </template>
        </v-tooltip>
      </template>
    </MessageContentCallView>
  </v-dialog>
</template>
