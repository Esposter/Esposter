<script setup lang="ts">
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { useRoomCategoryDialogStore } from "@/store/message/roomCategoryDialog";
import { withFinalizerAsync } from "@esposter/shared";

const roomCategoryStore = useRoomCategoryStore();
const { roomCategories } = storeToRefs(roomCategoryStore);
const { deleteRoomCategory } = roomCategoryStore;
const roomCategoryDialogStore = useRoomCategoryDialogStore();
const { deletingId } = storeToRefs(roomCategoryDialogStore);
const { isOpen, item: category } = useSingletonDialog(deletingId, () =>
  roomCategories.value.find(({ id }) => id === deletingId.value),
);
</script>

<template>
  <StyledDeleteFormDialog
    v-if="category"
    v-model="isOpen"
    :card-props="{ title: 'Delete Category' }"
    @delete="
      async (onComplete) => {
        if (!category) return;
        const categoryId = category.id;
        await withFinalizerAsync(() => deleteRoomCategory(categoryId), onComplete);
      }
    "
  >
    Are you sure you want to delete {{ category.name }}?
  </StyledDeleteFormDialog>
</template>
