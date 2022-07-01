<template>
  <v-container fluid>
    <v-row class="flex align-center">
      <v-col class="text-h5 font-bold">Chats</v-col>
      <v-col class="flex justify-end">
        <v-btn icon="mdi-plus" size="small" flat />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <ChatRoomSearchBar />
      </v-col>
    </v-row>
  </v-container>
</template>
