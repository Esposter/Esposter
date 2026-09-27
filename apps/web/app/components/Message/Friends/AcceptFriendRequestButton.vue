<script setup lang="ts">
import type { PublicUser } from "@esposter/db-schema";

import { useFriendRequestStore } from "@/store/message/user/friendRequest";

interface Props {
  sender: PublicUser;
}

const { sender } = defineProps<Props>();
const friendRequestStore = useFriendRequestStore();
const { acceptFriendRequest } = friendRequestStore;
</script>

<template>
  <UiButton @click="acceptFriendRequest(sender)">Accept</UiButton>
</template>
