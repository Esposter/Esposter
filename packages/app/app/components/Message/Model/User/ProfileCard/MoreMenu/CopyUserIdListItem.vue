<script setup lang="ts">
import { useClipboardStore } from "@/store/clipboard";

interface Props {
  userId: string;
}

const { userId } = defineProps<Props>();
const clipboardStore = useClipboardStore();
const { copy } = clipboardStore;
</script>

<template>
  <v-list-item append-icon="mdi-identifier" title="Copy User ID" @click="copy(userId)" />
</template>
