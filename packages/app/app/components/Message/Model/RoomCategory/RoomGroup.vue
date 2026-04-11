<script setup lang="ts">
import type { Room, RoomCategory } from "@esposter/db-schema";

interface RoomCategoryRoomGroupProps {
  category?: RoomCategory;
  rooms: Room[];
}

const { category, rooms } = defineProps<RoomCategoryRoomGroupProps>();
const isCollapsed = useLocalStorage(`message-category-${category?.id ?? "uncategorized"}-collapsed`, false);
</script>

<template>
  <div>
    <v-list-item v-if="category" density="compact" font-bold text-xs uppercase @click="isCollapsed = !isCollapsed">
      <v-list-item-title>
        <div flex items-center gap-1>
          <v-icon :icon="isCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-down'" size="x-small" />
          {{ category.name }}
        </div>
      </v-list-item-title>
    </v-list-item>
    <TransitionFade>
      <div v-show="!isCollapsed">
        <MessageModelRoomListItem v-for="room of rooms" :key="room.id" :room />
      </div>
    </TransitionFade>
  </div>
</template>
