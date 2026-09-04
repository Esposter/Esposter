<script setup lang="ts">
import type { RoomCategoryInMessage, RoomInMessage } from "@esposter/db-schema";

import { ROOM_CATEGORY_DRAG_HANDLE_CLASS } from "@/services/message/roomCategory/constants";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

interface Props {
  category?: RoomCategoryInMessage;
  rooms: RoomInMessage[];
}

const { category, rooms } = defineProps<Props>();
const emit = defineEmits<{ move: [direction: -1 | 1] }>();
const isCollapsed = useLocalStorage(LocalStorageKey.MessageCategoryCollapsed(category?.id ?? "uncategorized"), false);
</script>

<template>
  <div>
    <v-list-item
      v-if="category"
      :class="ROOM_CATEGORY_DRAG_HANDLE_CLASS"
      density="compact"
      font-bold
      uppercase
      text-label-medium
      @click="isCollapsed = !isCollapsed"
      @keydown.alt.up.prevent="emit('move', -1)"
      @keydown.alt.down.prevent="emit('move', 1)"
    >
      <v-list-item-title>
        <div flex gap-1 items-center>
          <v-icon :icon="isCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-down'" size="x-small" />
          {{ category.name }}
        </div>
      </v-list-item-title>
      <template #append>
        <MessageModelRoomCategoryDeleteButton :category />
      </template>
    </v-list-item>
    <TransitionFade>
      <div v-show="!isCollapsed">
        <MessageModelRoomListItem v-for="room of rooms" :key="room.id" :room />
      </div>
    </TransitionFade>
  </div>
</template>
