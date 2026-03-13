<script setup lang="ts">
import type { VForm } from "vuetify/components";

interface EditDialogButtonProps {
  disabled?: boolean;
  title: string;
  tooltipText: string;
}

defineSlots<{ default: () => VNode }>();
const { disabled = false } = defineProps<EditDialogButtonProps>();
const emit = defineEmits<{ submit: [onComplete: () => void] }>();
const editFormRef = ref<InstanceType<typeof VForm>>();
const isEditFormValid = ref(true);
</script>

<template>
  <StyledDialog
    :card-props="{ title }"
    :confirm-button-props="{ text: 'Save & Close' }"
    :confirm-button-attrs="{ disabled: !isEditFormValid || disabled }"
    @submit="(_event, onComplete) => emit('submit', onComplete)"
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip :text="tooltipText">
        <template #activator="{ props: tooltipProps }">
          <v-btn m-0 icon="mdi-pencil" size="small" tile :="tooltipProps" @click.stop="updateIsOpen(true)" />
        </template>
      </v-tooltip>
    </template>
    <template #prepend-actions>
      <StyledEditFormDialogErrorIcon :edit-form-ref :is-edit-form-valid />
    </template>
    <v-form ref="editFormRef" v-model="isEditFormValid">
      <slot />
    </v-form>
  </StyledDialog>
</template>
