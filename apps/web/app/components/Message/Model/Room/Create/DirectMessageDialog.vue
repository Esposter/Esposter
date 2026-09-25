<script setup lang="ts">
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { withFinalizerAsync } from "@esposter/shared";

const isOpen = defineModel<boolean>({ default: false });
const directMessageStore = useDirectMessageStore();
const { createDirectMessage } = directMessageStore;
const friendPicker = useTemplateRef("friendPicker");
const selectedUserIds = ref<string[]>([]);
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    confirm-label="Create Message"
    :is-confirm-disabled="selectedUserIds.length === 0 || undefined"
    title="New Message"
    @submit="
      async (onComplete) => {
        await withFinalizerAsync(async () => {
          await createDirectMessage(selectedUserIds);
          selectedUserIds = [];
          friendPicker?.reset();
        }, onComplete);
      }
    "
  >
    <MessageModelRoomDirectMessageFriendPicker ref="friendPicker" v-model="selectedUserIds" is-multiple />
  </StyledFormDialog>
</template>
