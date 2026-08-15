<script setup lang="ts">
import { useBlockStore } from "@/store/message/user/block";

interface BlockUserButtonProps {
  userId: string;
}

const { userId } = defineProps<BlockUserButtonProps>();
const blockStore = useBlockStore();
const { blockUser } = blockStore;
</script>

<template>
  <v-btn color="error" size="small" text="Block" variant="tonal" @click="blockUser(userId)" />
</template>
