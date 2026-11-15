<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { useBlockStore } from "#src/store/message/user/block";

interface Props {
  userId: string;
}

defineProps<Props>();
const blockStore = useBlockStore();
const { createBlock } = blockStore;
</script>

<template>
  <UiButton :variant="UiButtonVariant.Quiet" @click="createBlock(userId)">Block</UiButton>
</template>
