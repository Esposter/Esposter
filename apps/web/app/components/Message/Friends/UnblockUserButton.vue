<script setup lang="ts">
import { useFriendDialogStore } from "@/store/message/user/friendDialog";

interface Props {
  userId: string;
}

const { userId } = defineProps<Props>();
const friendDialogStore = useFriendDialogStore();
const { unblockingUserId } = storeToRefs(friendDialogStore);
</script>

<template>
  <UiButton @click="unblockingUserId = userId">Unblock</UiButton>
</template>
