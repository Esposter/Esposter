<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { RoomCategoryInMessage, RoomInMessage } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { ROOM_CATEGORY_DRAG_HANDLE_CLASS } from "@/services/message/roomCategory/constants";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useRoomCategoryDialogStore } from "@/store/message/roomCategoryDialog";

interface Props {
  category?: RoomCategoryInMessage;
  rooms: RoomInMessage[];
}

const { category, rooms } = defineProps<Props>();
const emit = defineEmits<{ move: [direction: -1 | 1] }>();
const roomCategoryDialogStore = useRoomCategoryDialogStore();
const { deletingId } = storeToRefs(roomCategoryDialogStore);
const isCollapsed = useLocalStorage(LocalStorageKey.MessageCategoryCollapsed(category?.id ?? "uncategorized"), false);
const isOpen = computed({
  get: () => !isCollapsed.value,
  set: (newIsOpen) => {
    isCollapsed.value = !newIsOpen;
  },
});
const { getContextMenuProps } = useContextMenu();
// Dragging the grip reorders categories by pointer; the menu moves one a step at a time by keyboard
const getCategoryItems = (categoryId: RoomCategoryInMessage["id"]): Item[] => [
  {
    meaning: UiIconMeaning.ArrowUp,
    onClick: () => {
      emit("move", -1);
    },
    title: "Move up",
  },
  {
    meaning: UiIconMeaning.ArrowDown,
    onClick: () => {
      emit("move", 1);
    },
    title: "Move down",
  },
  {
    isDanger: true,
    isGroupStart: true,
    meaning: UiIconMeaning.Delete,
    onClick: () => {
      deletingId.value = categoryId;
    },
    title: "Delete category",
  },
];
</script>

<template>
  <div>
    <!-- A right-click on the header opens the same actions its overflow button does -->
    <UiCollapsible
      v-if="category"
      v-model="isOpen"
      :header-attrs="getContextMenuProps(category.id, () => getCategoryItems(category.id))"
    >
      <template #title>
        <span text-sm text-muted flex-1 min-w-0 truncate uppercase>{{ category.name }}</span>
      </template>
      <template #actions>
        <span :class="ROOM_CATEGORY_DRAG_HANDLE_CLASS" aria-hidden="true" text-muted flex cursor-grab>
          <UiIcon :meaning="UiIconMeaning.Drag" />
        </span>
        <UiOverflowMenu :items="getCategoryItems(category.id)" :label="`${category.name} actions`" />
      </template>
      <MessageModelRoomListItem v-for="room of rooms" :key="room.id" :room />
    </UiCollapsible>
    <template v-else>
      <MessageModelRoomListItem v-for="room of rooms" :key="room.id" :room />
    </template>
  </div>
</template>
