<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { ROOM_CATEGORY_NAME_MAX_LENGTH } from "@esposter/db-schema";
import { withFinalizerAsync } from "@esposter/shared";

const rules = useVRules();
const nameRules = computed(() => [rules.required(), rules.maxLength(ROOM_CATEGORY_NAME_MAX_LENGTH)]);
const roomCategoryStore = useRoomCategoryStore();
const { createRoomCategory } = roomCategoryStore;
const isOpen = ref(false);
const isValid = ref(true);
const isPending = ref(false);
const name = ref("");
</script>

<template>
  <UiIconButton
    label="Create category"
    :meaning="UiIconMeaning.Folder"
    :variant="UiButtonVariant.Quiet"
    @click.stop="isOpen = true"
  />
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="New category" w="[min(32rem,90vw)]">
    <UiForm
      v-model:is-valid="isValid"
      p-3
      flex
      flex-col
      gap-3
      @submit="
        async () => {
          isPending = true;
          await withFinalizerAsync(
            async () => {
              await createRoomCategory({ name });
              name = '';
            },
            () => {
              isPending = false;
              isOpen = false;
            },
          );
        }
      "
    >
      <UiTextField
        v-model="name"
        :counter="ROOM_CATEGORY_NAME_MAX_LENGTH"
        is-autofocus
        label="Category name"
        :rules="nameRules"
      />
      <footer flex gap-2 justify-end>
        <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
        <UiButton :disabled="!isValid || isPending" type="submit" :variant="UiButtonVariant.Accent">
          <UiSpinner v-if="isPending" />
          Create category
        </UiButton>
      </footer>
    </UiForm>
  </UiDialog>
</template>
