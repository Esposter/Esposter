<script setup lang="ts">
const isCollapsed = useLocalStorage("message-sidebar-rooms-collapsed", false);
</script>

<template>
  <MessageModelRoomList :is-collapsed>
    <template #prepend>
      <v-list-item font-bold @click="isCollapsed = !isCollapsed">
        Rooms
        <template #append>
          <v-icon :icon="isCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-down'" size="small" />
          <MessageModelRoomCreateButton />
        </template>
      </v-list-item>
    </template>
  </MessageModelRoomList>
</template>
