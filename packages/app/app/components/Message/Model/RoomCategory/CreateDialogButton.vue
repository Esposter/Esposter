<script setup lang="ts">
import type { SubmitEventPromise } from "vuetify";

import { formRules } from "@/services/vuetify/formRules";
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { ROOM_CATEGORY_NAME_MAX_LENGTH } from "@esposter/db-schema";

const roomCategoryStore = useRoomCategoryStore();
const { createRoomCategory } = roomCategoryStore;
const dialog = ref(false);
const name = ref("");

const submit = async (_event: SubmitEventPromise, onComplete: () => void) => {
  const trimmedName = name.value.trim();
  if (!trimmedName) return;

  try {
    await createRoomCategory({ name: trimmedName });
    name.value = "";
  } finally {
    onComplete();
  }
};
</script>

<template>
  <StyledFormDialog
    v-model="dialog"
    :card-props="{ title: 'New Category', minWidth: 400 }"
    :confirm-button-props="{ text: 'Create Category' }"
    @submit="submit"
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Add Category">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            :="tooltipProps"
            icon="mdi-folder-plus-outline"
            size="small"
            variant="plain"
            @click="updateIsOpen(true)"
          />
        </template>
      </v-tooltip>
    </template>
    <v-container>
      <v-text-field
        v-model="name"
        label="Category name"
        density="compact"
        autofocus
        :maxlength="ROOM_CATEGORY_NAME_MAX_LENGTH"
        :rules="[formRules.required, formRules.requireAtMostNCharacters(ROOM_CATEGORY_NAME_MAX_LENGTH)]"
        variant="outlined"
      />
    </v-container>
  </StyledFormDialog>
</template>
