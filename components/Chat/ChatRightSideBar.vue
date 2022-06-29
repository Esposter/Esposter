<script setup lang="ts">
import chatMembers from "../../assets/data/chatMembers.json";
</script>

<template>
  <v-navigation-drawer permanent location="right">
    <ChatRightSideBarHeader />
    <ChatMemberList :chat-members="chatMembers" />
  </v-navigation-drawer>
</template>
