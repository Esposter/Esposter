<script setup lang="ts">
import type { SerializableValue } from "@esposter/db-schema";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoomStore } from "@/store/message/room";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
const { readMoreRooms, readRooms } = await useReadRooms();
const { isPending } = await readRooms();
const roomStore = useRoomStore();
const { hasMore, rooms } = storeToRefs(roomStore);
</script>

<template>
  <MessageRightSideBarSearchFilterPickerList :has-more :is-pending @read-more="readMoreRooms">
    <template #skeleton>
      <v-skeleton-loader v-for="i in DEFAULT_READ_LIMIT" :key="i" type="list-item-avatar" />
    </template>
    <v-hover v-for="room of rooms" :key="room.id" #default="{ isHovering, props: hoverProps }">
      <v-list-item :="hoverProps" @click="emit('select', room.id)">
        <template #prepend>
          <StyledAvatar :image="room.image" :name="room.name" size="small" />
        </template>
        <v-list-item-title>{{ room.name }}</v-list-item-title>
        <template #append>
          <v-icon :op="isHovering ? undefined : '0!'" icon="mdi-plus" />
        </template>
      </v-list-item>
    </v-hover>
  </MessageRightSideBarSearchFilterPickerList>
</template>
