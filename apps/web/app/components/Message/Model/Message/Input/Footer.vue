<script setup lang="ts">
import { getTypingMessage } from "@/services/message/getTypingMessage";
import { useDataStore } from "@/store/message/data";

const dataStore = useDataStore();
const { typings } = storeToRefs(dataStore);
const typingMessage = computed(() => getTypingMessage(typings.value.map(({ username }) => username)));
</script>

<template>
  <!-- A non-breaking space so an empty footer still reserves its line and the composer above does not shift -->
  <div text-sm>{{ typingMessage }}&nbsp;</div>
</template>
