<script setup lang="ts">
import { FRIENDS_ACTION_BUTTON_PROPS } from "@/services/message/friend/constants";
import { useBlockStore } from "@/store/message/user/block";

interface UnblockUserButtonProps {
  userId: string;
}

const { userId } = defineProps<UnblockUserButtonProps>();
const blockStore = useBlockStore();
const { deleteBlock } = blockStore;
</script>

<template>
  <v-btn :="FRIENDS_ACTION_BUTTON_PROPS" text="Unblock" @click="deleteBlock(userId)" />
</template>
