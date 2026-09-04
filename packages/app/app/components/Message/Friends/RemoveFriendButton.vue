<script setup lang="ts">
import { FRIENDS_ACTION_BUTTON_PROPS } from "@/services/message/friend/constants";
import { useFriendStore } from "@/store/message/user/friend";

interface Props {
  userId: string;
}

const { userId } = defineProps<Props>();
const friendStore = useFriendStore();
const { deleteFriend } = friendStore;
</script>

<template>
  <v-btn :="FRIENDS_ACTION_BUTTON_PROPS" color="error" text="Remove" @click="deleteFriend(userId)" />
</template>
