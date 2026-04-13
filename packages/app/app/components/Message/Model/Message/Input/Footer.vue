<script setup lang="ts">
import { getTypingMessage } from "@/services/message/getTypingMessage";
import { useDataStore } from "@/store/message/data";

const dataStore = useDataStore();
const { typings } = storeToRefs(dataStore);
const typingMessage = computed(() => getTypingMessage(typings.value.map(({ username }) => username)));
</script>

<template>
  <!-- Add &nbsp; to avoid layout shift -->
  <div class="text-sm">{{ typingMessage }}&nbsp;</div>
</template>
