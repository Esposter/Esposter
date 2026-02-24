<template>
  <MessageModelRoomList overflow-y-auto>
    <template #prepend>
      <v-list-item font-bold>
        Rooms
        <template #append>
          <MessageModelRoomCreateButton />
        </template>
      </v-list-item>
    </template>
  </MessageModelRoomList>
</template>
