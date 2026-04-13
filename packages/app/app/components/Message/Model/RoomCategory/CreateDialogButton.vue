<script setup lang="ts">
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { ROOM_CATEGORY_NAME_MAX_LENGTH } from "@esposter/db-schema";
import { mergeProps } from "vue";

const roomCategoryStore = useRoomCategoryStore();
const { createRoomCategory } = roomCategoryStore;
const dialog = ref(false);
const name = ref("");
const { execute, isLoading } = useInFlight();
const submit = () =>
  execute(async () => {
    const trimmedName = name.value.trim();
    if (!trimmedName) return;
    await createRoomCategory({ name: trimmedName });
    name.value = "";
    dialog.value = false;
  });
</script>

<template>
  <v-dialog v-model="dialog" max-width="400">
    <template #activator="{ props: dialogProps }">
      <v-tooltip text="Add Category">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            :="mergeProps(dialogProps, tooltipProps)"
            icon="mdi-folder-plus-outline"
            size="small"
            variant="plain"
          />
        </template>
      </v-tooltip>
    </template>
    <StyledCard>
      <v-card-title>New Category</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="name"
          label="Category name"
          density="compact"
          hide-details
          :maxlength="ROOM_CATEGORY_NAME_MAX_LENGTH"
          variant="outlined"
          autofocus
          @keydown.enter="submit()"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text="Cancel" variant="plain" @click="dialog = false" />
        <v-btn
          color="primary"
          text="Create"
          variant="elevated"
          :disabled="isLoading"
          :loading="isLoading"
          @click="submit()"
        />
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
