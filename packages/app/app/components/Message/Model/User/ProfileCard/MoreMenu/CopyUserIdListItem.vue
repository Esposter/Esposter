<script setup lang="ts">
interface CopyUserIdListItemProps {
  userId: string;
}

const { userId } = defineProps<CopyUserIdListItemProps>();
const { copy } = useClipboard();
</script>

<template>
  <v-list-item append-icon="mdi-identifier" title="Copy User ID" @click="copy(userId)" />
</template>
