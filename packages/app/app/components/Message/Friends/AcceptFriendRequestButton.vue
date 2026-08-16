<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { useFriendRequestStore } from "@/store/message/user/friendRequest";

interface AcceptFriendRequestButtonProps {
  sender: User;
}

const { sender } = defineProps<AcceptFriendRequestButtonProps>();
const friendRequestStore = useFriendRequestStore();
const { acceptFriendRequest } = friendRequestStore;
</script>

<template>
  <v-btn color="success" size="small" text="Accept" variant="tonal" @click="acceptFriendRequest(sender)" />
</template>
