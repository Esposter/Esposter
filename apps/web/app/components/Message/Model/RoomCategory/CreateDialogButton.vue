<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiRules } from "@/services/ui/UiRules";
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { ROOM_CATEGORY_NAME_MAX_LENGTH } from "@esposter/db-schema";

const nameRules = [UiRules.required(), UiRules.maxLength(ROOM_CATEGORY_NAME_MAX_LENGTH)];
const roomCategoryStore = useRoomCategoryStore();
const { createRoomCategory } = roomCategoryStore;
const isOpen = ref(false);
const name = ref("");
</script>

<template>
  <UiIconButton
    label="Create category"
    :meaning="UiIconMeaning.Folder"
    :variant="UiButtonVariant.Quiet"
    @click.stop="isOpen = true"
  />
  <!-- The category appears in the list as a placeholder the moment it is asked for, so the dialog goes with it -->
  <StyledFormDialog
    v-model="isOpen"
    confirm-label="Create category"
    is-optimistic
    :submit="
      () => {
        const createdRoomCategory = createRoomCategory({ name });
        name = '';
        return createdRoomCategory;
      }
    "
    title="New category"
    w="[min(32rem,90vw)]"
  >
    <UiTextField
      v-model="name"
      :counter="ROOM_CATEGORY_NAME_MAX_LENGTH"
      is-autofocus
      label="Category name"
      :rules="nameRules"
    />
  </StyledFormDialog>
</template>
