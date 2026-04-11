<script setup lang="ts">
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { ROOM_CATEGORY_NAME_MAX_LENGTH } from "@esposter/db-schema";

const roomCategoryStore = useRoomCategoryStore();
const { createRoomCategory } = roomCategoryStore;
const dialog = ref(false);
const name = ref("");

const onSubmit = async () => {
  const trimmed = name.value.trim();
  if (!trimmed) return;
  await createRoomCategory({ name: trimmed });
  name.value = "";
  dialog.value = false;
};
</script>

<template>
  <v-dialog v-model="dialog" max-width="400">
    <template #activator="{ props: dialogProps }">
      <v-tooltip text="Add Category">
        <template #activator="{ props: tooltipProps }">
          <v-btn :="{ ...dialogProps, ...tooltipProps }" icon="mdi-folder-plus-outline" size="small" variant="plain" />
        </template>
      </v-tooltip>
    </template>
    <StyledCard p-4 flex flex-col gap-4>
      <div font-bold text-base>New Category</div>
      <v-text-field
        v-model="name"
        label="Category name"
        density="compact"
        hide-details
        :maxlength="ROOM_CATEGORY_NAME_MAX_LENGTH"
        variant="outlined"
        autofocus
        @keydown.enter="onSubmit"
      />
      <div flex justify-end gap-2>
        <v-btn text="Cancel" variant="plain" @click="dialog = false" />
        <v-btn color="primary" text="Create" variant="elevated" @click="onSubmit" />
      </div>
    </StyledCard>
  </v-dialog>
</template>
