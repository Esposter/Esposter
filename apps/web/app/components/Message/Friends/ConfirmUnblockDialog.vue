<script setup lang="ts">
import { useBlockStore } from "@/store/message/user/block";
import { useFriendDialogStore } from "@/store/message/user/friendDialog";

const blockStore = useBlockStore();
const { blockedUsers } = storeToRefs(blockStore);
const { deleteBlock } = blockStore;
const friendDialogStore = useFriendDialogStore();
const { unblockingUserId } = storeToRefs(friendDialogStore);
const { isOpen, item: blockedUser } = useSingletonDialog(unblockingUserId, () =>
  blockedUsers.value.find(({ id }) => id === unblockingUserId.value),
);
</script>

<template>
  <UiConfirmDialog
    v-if="blockedUser"
    v-model="isOpen"
    confirm-label="Unblock"
    :title="`Unblock ${blockedUser.name}`"
    :confirm="() => blockedUser && deleteBlock(blockedUser.id)"
    is-optimistic
  >
    <p>Are you sure you want to unblock {{ blockedUser.name }}? They will be able to message you again.</p>
  </UiConfirmDialog>
</template>
