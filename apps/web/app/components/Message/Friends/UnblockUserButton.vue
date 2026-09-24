<script setup lang="ts">
import { useBlockStore } from "@/store/message/user/block";

interface Props {
  userId: string;
}

const { userId } = defineProps<Props>();
const blockStore = useBlockStore();
const { deleteBlock } = blockStore;
</script>

<template>
  <UiButton @click="deleteBlock(userId)">Unblock</UiButton>
</template>
