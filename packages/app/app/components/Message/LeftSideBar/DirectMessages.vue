<script setup lang="ts">
const isCollapsed = useLocalStorage("message-sidebar-dms-collapsed", false);
</script>

<template>
  <MessageModelRoomDirectMessageList :is-collapsed overflow-y-auto>
    <template #prepend>
      <v-list-item font-bold @click="isCollapsed = !isCollapsed">
        Direct Messages
        <template #append>
          <v-icon :icon="isCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-down'" size="small" />
          <MessageModelRoomCreateDirectMessageButton />
        </template>
      </v-list-item>
    </template>
  </MessageModelRoomDirectMessageList>
</template>
