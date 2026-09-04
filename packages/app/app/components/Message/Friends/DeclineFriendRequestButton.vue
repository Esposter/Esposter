<script setup lang="ts">
import { FRIENDS_ACTION_BUTTON_PROPS } from "@/services/message/friend/constants";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

interface Props {
  userId: string;
}

const { userId } = defineProps<Props>();
const friendRequestStore = useFriendRequestStore();
const { declineFriendRequest } = friendRequestStore;
</script>

<template>
  <v-btn :="FRIENDS_ACTION_BUTTON_PROPS" color="error" text="Decline" @click="declineFriendRequest(userId)" />
</template>
