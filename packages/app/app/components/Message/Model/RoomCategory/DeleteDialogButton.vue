<script setup lang="ts">
import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { getResultAsync } from "#shared/util/getResultAsync";
import { withFinalizer } from "#shared/util/withFinalizer";
import { useRoomCategoryStore } from "@/store/message/roomCategory";

interface RoomCategoryDeleteDialogButtonProps {
  category: RoomCategoryInMessage;
}

const { category } = defineProps<RoomCategoryDeleteDialogButtonProps>();
const roomCategoryStore = useRoomCategoryStore();
const { deleteRoomCategory } = roomCategoryStore;
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{ title: 'Delete Category', text: `Are you sure you want to delete ${category.name}?` }"
    @delete="
      async (onComplete) => {
        await withFinalizer(
          getResultAsync(() => deleteRoomCategory(category.id)),
          () => getResultAsync(onComplete),
        );
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Delete Category">
        <template #activator="{ props }">
          <v-btn icon="mdi-delete" size="x-small" variant="plain" :="props" @click.stop="updateIsOpen(true)" />
        </template>
      </v-tooltip>
    </template>
  </StyledDeleteFormDialog>
</template>
