<script setup lang="ts">
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { LocalStorageKey } from "#src/services/shared/LocalStorageKey";
import { useRoomStore } from "#src/store/message/room/index";

const isOpen = useSidebarSectionOpen(LocalStorageKey.MessageSidebarRoomsCollapsed);
const { isError: isRoomCategoriesError, readRoomCategories } = useReadRoomCategories();
const roomStore = useRoomStore();
const { hasMore, rooms } = storeToRefs(roomStore);
const { readMoreRooms, readRooms } = await useReadRooms();
const [{ isError, isPending, refresh }] = await Promise.all([readRooms(), readRoomCategories()]);
const { moveRoomCategory, roomCategoryGroups, roomCategoryReorderProps, uncategorizedRooms } = useRoomCategoryGroups();
</script>

<template>
  <UiCollapsible v-model="isOpen">
    <template #title>Rooms</template>
    <template #actions>
      <MessageModelRoomCategoryCreateDialogButton />
      <MessageModelRoomCreateButton />
    </template>
    <MessageModelRoomBaseList :has-more :is-pending @load-more="(onComplete) => readMoreRooms(onComplete)">
      <!-- A failed read is not a reader with no rooms: it says so and tries again, as the message list does -->
      <UiErrorState v-if="isError" error="The rooms could not be loaded." @retry="refresh()" />
      <UiEmptyState
        v-else-if="rooms.length === 0"
        description="Create a room or join one with an invite link."
        :meaning="UiIconMeaning.Comment"
        title="No rooms yet"
      />
      <!-- The categories are the headers the rooms group under, so a failed read leaves every room listed and says
           what is missing -->
      <UiErrorState
        v-if="isRoomCategoriesError"
        error="The room categories could not be loaded."
        @retry="readRoomCategories()"
      />
      <MessageModelRoomCategoryRoomGroup :rooms="uncategorizedRooms" />
      <div :="roomCategoryReorderProps">
        <MessageModelRoomCategoryRoomGroup
          v-for="{ roomCategory, rooms: roomCategoryRooms } of roomCategoryGroups"
          :key="roomCategory.id"
          :category="roomCategory"
          :rooms="roomCategoryRooms"
          @move="moveRoomCategory(roomCategory.id, $event)"
        />
      </div>
    </MessageModelRoomBaseList>
  </UiCollapsible>
  <MessageModelRoomInviteDialog />
  <MessageModelRoomSettingsDialog />
  <MessageModelRoomCategoryConfirmDeleteDialog />
</template>
