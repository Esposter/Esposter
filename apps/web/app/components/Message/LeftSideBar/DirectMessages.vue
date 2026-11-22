<script setup lang="ts">
import { LocalStorageKey } from "#src/services/shared/LocalStorageKey";

const isOpen = useSidebarSectionOpen(LocalStorageKey.MessageSidebarDirectMessagesCollapsed);
</script>

<template>
  <UiCollapsible v-model="isOpen">
    <template #title>Direct Messages</template>
    <template #actions>
      <MessageModelRoomCreateDirectMessageButton />
    </template>
    <MessageModelRoomDirectMessageList />
  </UiCollapsible>
</template>
