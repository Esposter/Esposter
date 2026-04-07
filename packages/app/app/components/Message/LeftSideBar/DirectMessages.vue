<template>
  <MessageModelRoomDirectMessageList overflow-y-auto>
    <template #prepend>
      <v-list-item font-bold>
        Direct Messages
        <template #append>
          <MessageModelRoomCreateDirectMessageButton />
        </template>
      </v-list-item>
    </template>
  </MessageModelRoomDirectMessageList>
</template>
