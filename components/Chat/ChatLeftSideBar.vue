<script setup lang="ts">
const chatRooms = [
  {
    avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg",
    subtitle: `I'll be in your neighborhood doing errands this weekend. Do you want to hang out?`,
    title: "Ali Connors",
  },
  {
    avatar: "https://cdn.vuetifyjs.com/images/lists/2.jpg",
    subtitle: `Wish I could come, but I'm out of town this weekend.`,
    title: "me, Scrott, Jennifer",
  },
  {
    avatar: "https://cdn.vuetifyjs.com/images/lists/3.jpg",
    subtitle: "Do you have Paris recommendations? Have you ever been?",
    title: "Sandra Adams",
  },
  {
    avatar: "https://cdn.vuetifyjs.com/images/lists/4.jpg",
    subtitle: "Have any ideas about what we should get Heidi for her birthday?",
    title: "Trevor Hansen",
  },
  {
    avatar: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
    subtitle: "We should eat this: Grate, Squash, Corn, and tomatillo Tacos.",
    title: "Britta Holt",
  },
];
</script>

<template>
  <v-navigation-drawer permanent>
    <ChatRoomHeader />
    <ChatRoomList :chat-rooms="chatRooms" />
  </v-navigation-drawer>
</template>
