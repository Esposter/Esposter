<script setup lang="ts">
import type { PublicUser } from "@esposter/db-schema";

import { useFriendRequestStore } from "#src/store/message/user/friendRequest";

interface Props {
  userId: PublicUser["id"];
}

defineProps<Props>();
const friendRequestStore = useFriendRequestStore();
const { checkIsSendFriendRequestPending, sendFriendRequest } = friendRequestStore;
</script>

<template>
  <UiButton :is-pending="checkIsSendFriendRequestPending(userId)" @click="sendFriendRequest(userId)">
    Send Request
  </UiButton>
</template>
