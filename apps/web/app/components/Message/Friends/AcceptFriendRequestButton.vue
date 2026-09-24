<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { useFriendRequestStore } from "@/store/message/user/friendRequest";

interface Props {
  sender: User;
}

const { sender } = defineProps<Props>();
const friendRequestStore = useFriendRequestStore();
const { acceptFriendRequest } = friendRequestStore;
</script>

<template>
  <UiButton @click="acceptFriendRequest(sender)">Accept</UiButton>
</template>
