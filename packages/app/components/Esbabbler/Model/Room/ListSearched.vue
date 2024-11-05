<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";
import { useRoomStore } from "@/store/esbabbler/room";

const emit = defineEmits<{ "update:room": [] }>();
const roomStore = useRoomStore();
const { roomsSearched } = storeToRefs(roomStore);
</script>

<template>
  <v-list>
    <NuxtInvisibleLink
      v-for="room of roomsSearched"
      :key="room.id"
      :to="RoutePath.Messages(room.id)"
      @click="emit('update:room')"
    >
      <v-list-item :title="room.name" :value="room.id">
        <template #prepend>
          <v-avatar v-if="room.image">
            <v-img :src="room.image" :alt="room.name" />
          </v-avatar>
          <StyledDefaultAvatar v-else :name="room.name" />
        </template>
      </v-list-item>
    </NuxtInvisibleLink>
  </v-list>
</template>
