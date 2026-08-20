<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { FRIENDS_ACTION_BUTTON_PROPS } from "@/services/message/friend/constants";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

interface AcceptFriendRequestButtonProps {
  sender: User;
}

const { sender } = defineProps<AcceptFriendRequestButtonProps>();
const friendRequestStore = useFriendRequestStore();
const { acceptFriendRequest } = friendRequestStore;
</script>

<template>
  <v-btn :="FRIENDS_ACTION_BUTTON_PROPS" color="success" text="Accept" @click="acceptFriendRequest(sender)" />
</template>
