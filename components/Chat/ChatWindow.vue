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
