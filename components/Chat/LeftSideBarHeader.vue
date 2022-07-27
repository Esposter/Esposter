<template>
  <v-container fluid>
    <v-row items="center">
      <v-col class="text-h5" font="bold">Chats</v-col>
      <v-col display="flex" justify="end">
        <ChatCreateRoomButton />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <ChatRoomSearchBar />
      </v-col>
    </v-row>
  </v-container>
</template>
