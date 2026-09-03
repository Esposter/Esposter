<script setup lang="ts">
import { FRIENDS_ACTION_BUTTON_PROPS } from "@/services/message/friend/constants";
import { useBlockStore } from "@/store/message/user/block";

interface BlockUserButtonProps {
  userId: string;
}

const { userId } = defineProps<BlockUserButtonProps>();
const blockStore = useBlockStore();
const { createBlock } = blockStore;
</script>

<template>
  <v-btn :="FRIENDS_ACTION_BUTTON_PROPS" color="error" text="Block" @click="createBlock(userId)" />
</template>
