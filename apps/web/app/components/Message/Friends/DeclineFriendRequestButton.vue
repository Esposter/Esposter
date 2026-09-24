<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

interface Props {
  userId: string;
}

const { userId } = defineProps<Props>();
const friendRequestStore = useFriendRequestStore();
const { declineFriendRequest } = friendRequestStore;
</script>

<template>
  <UiButton :variant="UiButtonVariant.Quiet" @click="declineFriendRequest(userId)">Decline</UiButton>
</template>
