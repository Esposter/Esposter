<script setup lang="ts">
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

interface DeclineFriendRequestButtonProps {
  userId: string;
}

const { userId } = defineProps<DeclineFriendRequestButtonProps>();
const friendRequestStore = useFriendRequestStore();
const { declineFriendRequest } = friendRequestStore;
</script>

<template>
  <v-btn color="error" size="small" text="Decline" variant="tonal" @click="declineFriendRequest(userId)" />
</template>
