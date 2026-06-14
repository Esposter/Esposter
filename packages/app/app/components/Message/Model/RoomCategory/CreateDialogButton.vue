<script setup lang="ts">
import { formRules } from "@/services/vuetify/formRules";
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { ROOM_CATEGORY_NAME_MAX_LENGTH } from "@esposter/db-schema";
import { withFinalizerAsync } from "@esposter/shared";

const roomCategoryStore = useRoomCategoryStore();
const { createRoomCategory } = roomCategoryStore;
const dialog = ref(false);
const name = ref("");
</script>

<template>
  <StyledFormDialog
    v-model="dialog"
    :card-props="{ title: 'New Category' }"
    :confirm-button-props="{ text: 'Create Category' }"
    @submit="
      async (_event, onComplete) =>
        await withFinalizerAsync(async () => {
          await createRoomCategory({ name });
          name = '';
        }, onComplete)
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Create Category">
        <template #activator="{ props: tooltipProps }">
          <v-btn :="tooltipProps" icon="mdi-folder-plus-outline" size="small" @click.stop="updateIsOpen(true)" />
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
