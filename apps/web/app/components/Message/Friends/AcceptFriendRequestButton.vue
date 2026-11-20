<script setup lang="ts">
import type { PublicUser } from "@esposter/db-schema";

import { useFriendRequestStore } from "#src/store/message/user/friendRequest";

interface Props {
  senderId: PublicUser["id"];
}

defineProps<Props>();
const friendRequestStore = useFriendRequestStore();
const { acceptFriendRequest } = friendRequestStore;
</script>

<template>
  <UiButton @click="acceptFriendRequest(senderId)">Accept</UiButton>
</template>
