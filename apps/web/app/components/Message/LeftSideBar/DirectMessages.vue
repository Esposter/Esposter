<script setup lang="ts">
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

const isCollapsed = useLocalStorage(LocalStorageKey.MessageSidebarDirectMessagesCollapsed, false);
</script>

<template>
  <MessageModelRoomDirectMessageList :is-collapsed overflow-y-auto>
    <template #prepend>
      <MessageLeftSideBarCollapsibleHeader v-model:collapsed="isCollapsed" title="Direct Messages">
        <template #append>
          <MessageModelRoomCreateDirectMessageButton />
        </template>
      </MessageLeftSideBarCollapsibleHeader>
    </template>
  </MessageModelRoomDirectMessageList>
</template>
