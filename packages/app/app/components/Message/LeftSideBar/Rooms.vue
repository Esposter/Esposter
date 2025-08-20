<template>
  <MessageModelRoomList>
    <template #prepend>
      <v-list-item font-bold>
        Rooms
        <template #append>
          <MessageModelRoomCreateButton />
        </template>
      </v-list-item>
    </template>
  </EsbabblerModelRoomList>
</template>
