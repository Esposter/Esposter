<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { useFriendRequestStore } from "#src/store/message/user/friendRequest";

interface Props {
  userId: string;
}

defineProps<Props>();
const friendRequestStore = useFriendRequestStore();
const { declineFriendRequest } = friendRequestStore;
</script>

<template>
  <UiButton :variant="UiButtonVariant.Quiet" @click="declineFriendRequest(userId)">Decline</UiButton>
</template>
