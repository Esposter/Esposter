<script setup lang="ts">
onMounted(() => {
  // Allow scrolling on chat content
  const mainWrap = document.getElementsByClassName("v-main__wrap");
  if (mainWrap.length) mainWrap[0].className += "flex flex-col";
});
</script>

<template>
  <v-navigation-drawer permanent app>
    <ChatLeftSideBar />
  </v-navigation-drawer>

  <v-navigation-drawer location="right" permanent app>
    <ChatRightSideBar />
  </v-navigation-drawer>

  <v-main class="h-screen">
    <ChatContent />
  </v-main>

  <v-footer app>
    <ChatMessageInput />
  </v-footer>
</template>
