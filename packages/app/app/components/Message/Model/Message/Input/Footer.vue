<script setup lang="ts">
import { getTypingMessage } from "@/services/message/getTypingMessage";
import { useDataStore } from "@/store/message/data";

const dataStore = useDataStore();
const { typings } = storeToRefs(dataStore);
</script>

<template>
  <!-- Add &nbsp; to avoid layout shift -->
  <div text-body-medium>{{ getTypingMessage(typings.map(({ username }) => username)) }}&nbsp;</div>
</template>
