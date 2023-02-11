<script setup lang="ts">
import { useMessageStore } from "@/store/useMessageStore";

const { sendMessage } = useMessageStore();
</script>

<template>
  <v-tooltip location="top" text="Press Enter to send">
    <template #activator="{ props }">
      <v-btn icon=" mdi-send" size="small" bg="transparent!" :="props" @click="sendMessage" />
    </template>
  </v-tooltip>
</template>
