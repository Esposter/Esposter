<script setup lang="ts">
import { useBanStore } from "@/store/message/user/ban";
import { useBanDialogStore } from "@/store/message/user/banDialog";

const banStore = useBanStore();
const { items } = storeToRefs(banStore);
const { deleteBan } = banStore;
const banDialogStore = useBanDialogStore();
const { unbanningUserId } = storeToRefs(banDialogStore);
const { isOpen, item: ban } = useSingletonDialog(unbanningUserId, () =>
  items.value.find(({ userId }) => userId === unbanningUserId.value),
);
</script>

<template>
  <UiConfirmDialog
    v-if="ban"
    v-model="isOpen"
    confirm-label="Unban"
    title="Unban user"
    :confirm="() => ban && deleteBan({ roomId: ban.roomId, userId: ban.userId })"
    is-optimistic
  >
    <p>Are you sure you want to unban {{ ban.user.name }}?</p>
  </UiConfirmDialog>
</template>
