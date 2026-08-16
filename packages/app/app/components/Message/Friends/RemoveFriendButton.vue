<script setup lang="ts">
import { useFriendStore } from "@/store/message/user/friend";

interface RemoveFriendButtonProps {
  userId: string;
}

const { userId } = defineProps<RemoveFriendButtonProps>();
const friendStore = useFriendStore();
const { deleteFriend } = friendStore;
</script>

<template>
  <v-btn color="error" size="small" text="Remove" variant="tonal" @click="deleteFriend(userId)" />
</template>
