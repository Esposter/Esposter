<script setup lang="ts">
import { useDirectMessageStore } from "@/store/message/room/directMessage";

const isOpen = defineModel<boolean>({ default: false });
const directMessageStore = useDirectMessageStore();
const { createDirectMessage } = directMessageStore;
const friendPicker = useTemplateRef("friendPicker");
const selectedUserIds = ref<string[]>([]);
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: 'New Message' }"
    :confirm-button-props="{ text: 'Create Message' }"
    :confirm-button-attrs="{ disabled: selectedUserIds.length === 0 }"
    @submit="
      async (_event, onComplete) => {
        await createDirectMessage(selectedUserIds);
        selectedUserIds = [];
        friendPicker?.reset();
        onComplete();
      }
    "
  >
    <MessageModelRoomDirectMessageFriendPicker ref="friendPicker" v-model="selectedUserIds" is-multiple />
  </StyledFormDialog>
</template>
