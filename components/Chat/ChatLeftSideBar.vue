<script setup lang="ts">
import chatRooms from "@/assets/data/chatRooms.json";
</script>

<template>
  <v-navigation-drawer permanent>
    <ChatLeftSideBarHeader />
    <ChatRoomList :chat-rooms="chatRooms" />
  </v-navigation-drawer>
</template>
