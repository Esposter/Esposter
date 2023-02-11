<script setup lang="ts">
import { RoutePath } from "@/models/router";
import { useRoomStore } from "@/store/chat/useRoomStore";
import type { Room } from "@prisma/client";

interface RoomListItemProps {
  room: Room;
}

const props = defineProps<RoomListItemProps>();
const { room } = $(toRefs(props));
const roomStore = useRoomStore();
const { currentRoomId } = $(storeToRefs(roomStore));
const isHovering = $ref(false);
const active = $computed(() => room.id === currentRoomId);
</script>

<template>
  <div position="relative" @mouseover="isHovering = true" @mouseleave="isHovering = false">
    <NuxtInvisibleLink :to="RoutePath.Messages(room.id)">
      <v-list-item :active="active" :title="room.name" :value="room.id">
        <template #prepend>
          <v-badge m="r-4" color="green" location="bottom end" dot>
            <v-avatar v-if="room.image">
              <v-img :src="room.image" :alt="room.name" />
            </v-avatar>
            <DefaultAvatar v-else :name="room.name" />
          </v-badge>
        </template>
      </v-list-item>
    </NuxtInvisibleLink>
    <ChatModelRoomDeleteButton
      v-show="isHovering"
      position="absolute"
      top="1/2"
      right="0"
      translate-y="-1/2"
      :room-id="room.id"
    />
  </div>
</template>
