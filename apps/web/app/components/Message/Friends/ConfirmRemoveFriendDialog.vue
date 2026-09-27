<script setup lang="ts">
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendDialogStore } from "@/store/message/user/friendDialog";

const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const { deleteFriend } = friendStore;
const friendDialogStore = useFriendDialogStore();
const { removingUserId } = storeToRefs(friendDialogStore);
const { isOpen, item: friend } = useSingletonDialog(removingUserId, () =>
  friends.value.find(({ id }) => id === removingUserId.value),
);
</script>

<template>
  <UiConfirmDialog
    v-if="friend"
    v-model="isOpen"
    confirm-label="Remove friend"
    :title="`Remove ${friend.name}`"
    :confirm="() => friend && deleteFriend(friend.id)"
    is-optimistic
  >
    <p>Are you sure you want to remove {{ friend.name }} from your friends?</p>
  </UiConfirmDialog>
</template>
