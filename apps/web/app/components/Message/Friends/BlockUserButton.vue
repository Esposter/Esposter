<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useBlockStore } from "@/store/message/user/block";

interface Props {
  userId: string;
}

const { userId } = defineProps<Props>();
const blockStore = useBlockStore();
const { createBlock } = blockStore;
</script>

<template>
  <UiButton :variant="UiButtonVariant.Quiet" @click="createBlock(userId)">Block</UiButton>
</template>
