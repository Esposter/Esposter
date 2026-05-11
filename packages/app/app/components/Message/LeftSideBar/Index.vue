<script setup lang="ts">
import { RoutePath } from "@esposter/shared";
</script>

<template>
  <div flex flex-col h-full>
    <MessageLeftSideBarHeader />
    <v-divider />
    <div flex-1 overflow-y-auto>
      <v-list-item font-bold :to="RoutePath.MessagesFriends">Friends</v-list-item>
      <v-divider />
      <MessageLeftSideBarRooms />
      <v-divider />
      <MessageLeftSideBarDirectMessages />
    </div>
    <MessageLeftSideBarStatusBar />
  </div>
</template>
