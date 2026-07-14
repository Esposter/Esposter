<script setup lang="ts">
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { ROOM_CATEGORY_NAME_MAX_LENGTH } from "@esposter/db-schema";
import { withFinalizerAsync } from "@esposter/shared";

const rules = useVRules();
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
      <StyledTooltipIconButton
        :button-props="{ size: 'small' }"
        icon="mdi-folder-plus-outline"
        text="Create Category"
        @click.stop="updateIsOpen(true)"
      />
    </template>
    <v-text-field
      v-model="name"
      autofocus
      density="compact"
      label="Category name"
      :maxlength="ROOM_CATEGORY_NAME_MAX_LENGTH"
      :rules="[rules.required(), rules.maxLength(ROOM_CATEGORY_NAME_MAX_LENGTH)]"
    />
  </StyledFormDialog>
</template>
