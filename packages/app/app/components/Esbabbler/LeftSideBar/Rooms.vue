<template>
  <EsbabblerModelRoomList>
    <template #prepend>
      <v-list-item font-bold>
        Rooms
        <template #append>
          <EsbabblerModelRoomCreateButton />
        </template>
      </v-list-item>
    </template>
  </EsbabblerModelRoomList>
</template>
