<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { MESSAGES_PATH } from "@/util/constants.client";
import type { Room } from "@prisma/client";
import { storeToRefs } from "pinia";

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

<!-- @NOTE: Route transitions doesn't like this component with invoke render outside of default slot :C -->
<template>
  <div position="relative" @mouseover="isHovering = true" @mouseleave="isHovering = false">
    <InvisibleNuxtLink :to="MESSAGES_PATH(room.id)">
      <v-list-item :active="active" :title="room.name" :value="room.id">
        <template #prepend>
          <v-badge m="r-4" color="green" location="bottom end" dot>
            <v-avatar v-if="room.avatar">
              <v-img :src="room.avatar" :alt="room.name" />
            </v-avatar>
            <DefaultAvatar v-else :name="room.name" />
          </v-badge>
        </template>
      </v-list-item>
    </InvisibleNuxtLink>
    <ChatDeleteRoomButton
      v-show="isHovering"
      position="absolute"
      top="1/2"
      right="0"
      translate-y="-1/2"
      :room-id="room.id"
    />
  </div>
</template>
