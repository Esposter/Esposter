<script setup lang="ts">
import { FRIENDS_ACTION_BUTTON_PROPS } from "@/services/message/friend/constants";
import { useFriendStore } from "@/store/message/user/friend";

interface RemoveFriendButtonProps {
  userId: string;
}

const { userId } = defineProps<RemoveFriendButtonProps>();
const friendStore = useFriendStore();
const { deleteFriend } = friendStore;
</script>

<template>
  <v-btn :="FRIENDS_ACTION_BUTTON_PROPS" color="error" text="Remove" @click="deleteFriend(userId)" />
</template>
