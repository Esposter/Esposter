<script setup lang="ts">
import { useBlockStore } from "@/store/message/user/block";

interface UnblockUserButtonProps {
  userId: string;
}

const { userId } = defineProps<UnblockUserButtonProps>();
const blockStore = useBlockStore();
const { unblockUser } = blockStore;
</script>

<template>
  <v-btn size="small" text="Unblock" variant="tonal" @click="unblockUser(userId)" />
</template>
