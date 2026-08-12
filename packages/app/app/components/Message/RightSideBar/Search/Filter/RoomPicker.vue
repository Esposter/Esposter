<script setup lang="ts">
import type { SerializableValue } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
const { readMoreRooms, readRooms } = await useReadRooms();
const { isPending } = await readRooms();
const roomStore = useRoomStore();
const { hasMore, rooms } = storeToRefs(roomStore);
</script>

<template>
  <MessageRightSideBarSearchFilterPickerList :has-more :is-pending @read-more="readMoreRooms">
    <v-hover v-for="room of rooms" :key="room.id" #default="{ isHovering, props: hoverProps }">
      <v-list-item :="hoverProps" @click="emit('select', room.id)">
        <template #prepend>
          <StyledAvatar :image="room.image" :name="room.name" size="small" />
        </template>
        <v-list-item-title>{{ room.name }}</v-list-item-title>
        <template #append>
          <MessageRightSideBarSearchAddIcon :is-hovering="isHovering ?? false" />
        </template>
      </v-list-item>
    </v-hover>
  </MessageRightSideBarSearchFilterPickerList>
</template>
