<template>
  <v-container fluid>
    <v-row align="center">
      <v-col text="h5" font="bold">Chats</v-col>
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
