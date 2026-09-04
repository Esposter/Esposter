<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { FRIENDS_ACTION_BUTTON_PROPS } from "@/services/message/friend/constants";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

interface Props {
  sender: User;
}

const { sender } = defineProps<Props>();
const friendRequestStore = useFriendRequestStore();
const { acceptFriendRequest } = friendRequestStore;
</script>

<template>
  <v-btn :="FRIENDS_ACTION_BUTTON_PROPS" color="success" text="Accept" @click="acceptFriendRequest(sender)" />
</template>
