<script setup lang="ts">
import { RoutePath } from "#shared/models/router/RoutePath";
import { useRoomStore } from "@/store/message/room";

const emit = defineEmits<{ "update:room": [] }>();
const roomStore = useRoomStore();
const { readMoreRoomsSearched } = roomStore;
const { hasMoreRoomsSearched, roomsSearched } = storeToRefs(roomStore);
</script>

<template>
  <v-list>
    <NuxtInvisibleLink
      v-for="{ id, name, image } of roomsSearched"
      :key="id"
      :to="RoutePath.Messages(id)"
      @click="emit('update:room')"
    >
      <v-list-item :title="name" :value="id">
        <template #prepend>
          <StyledAvatar :image :name />
        </template>
      </v-list-item>
    </NuxtInvisibleLink>
    <StyledWaypoint flex justify-center :active="hasMoreRoomsSearched" @change="readMoreRoomsSearched" />
  </v-list>
</template>
