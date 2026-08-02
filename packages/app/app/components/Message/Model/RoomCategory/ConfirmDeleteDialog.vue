<script setup lang="ts">
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { useRoomCategoryDialogStore } from "@/store/message/roomCategoryDialog";
import { withFinalizerAsync } from "@esposter/shared";

const roomCategoryStore = useRoomCategoryStore();
const { categories } = storeToRefs(roomCategoryStore);
const { deleteRoomCategory } = roomCategoryStore;
const roomCategoryDialogStore = useRoomCategoryDialogStore();
const { deletingId } = storeToRefs(roomCategoryDialogStore);
// Resolved through the primitive rather than a computed of our own, so a target whose category has left the
// List is dropped with it instead of re-opening this dialog by itself when a later read brings it back
const { isOpen, item: category } = useSingletonDialog(deletingId, () =>
  categories.value.find(({ id }) => id === deletingId.value),
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
