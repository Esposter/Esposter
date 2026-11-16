<script setup lang="ts">
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { useDirectMessageStore } from "#src/store/message/room/directMessage";

const isOpen = defineModel<boolean>({ default: false });
const directMessageStore = useDirectMessageStore();
const { createDirectMessage } = directMessageStore;
const friendPicker = useTemplateRef("friendPicker");
const selectedUserIds = ref<string[]>([]);
// The conversation is the server's to name, so the dialog waits for it, and the picker clears once it is kept. A refused
// Create leaves the dialog open on the friends picked, to try again
const createSelectedDirectMessage = async () => {
  const isCreated = await createDirectMessage(selectedUserIds.value);
  if (isCreated) {
    selectedUserIds.value = [];
    friendPicker.value?.reset();
  }
  return isCreated;
};
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :awaited-because="AwaitedReason.ServerIssuedValue"
    confirm-label="Create Message"
    :is-confirm-disabled="selectedUserIds.length === 0 || undefined"
    title="New Message"
    :submit="createSelectedDirectMessage"
  >
    <MessageModelRoomDirectMessageFriendPicker ref="friendPicker" v-model="selectedUserIds" is-multiple />
  </StyledFormDialog>
</template>
