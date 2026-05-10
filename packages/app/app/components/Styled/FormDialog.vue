<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { SubmitEventPromise } from "vuetify";
import type { VBtn, VCard, VForm } from "vuetify/components";

import { mergeProps } from "vue";

// @TODO: https://github.com/vuejs/core/issues/11371
export interface StyledFormDialogProps {
  cardProps?: VCard["$props"];
  confirmButtonAttrs?: VBtn["$attrs"];
  confirmButtonProps?: VBtn["$props"];
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => VNode;
  default: () => VNode;
  "prepend-actions": () => VNode;
}>();
const modelValue = defineModel<boolean>({ default: false });
const { cardProps, confirmButtonAttrs = {}, confirmButtonProps = {} } = defineProps<StyledFormDialogProps>();
const emit = defineEmits<{ submit: [event: SubmitEventPromise, onComplete: () => void] }>();
const editForm = ref<InstanceType<typeof VForm>>();
const isEditFormValid = ref(true);
const isSubmitting = ref(false);
const formId = useId();
const submit = (event: SubmitEventPromise) => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  emit("submit", event, () => {
    modelValue.value = false;
    isSubmitting.value = false;
  });
};

defineExpose({ editForm, isEditFormValid });
</script>

<template>
  <StyledDialog
    v-model="modelValue"
    :card-props
    :confirm-button-props
    :confirm-button-attrs="
      mergeProps(confirmButtonAttrs, {
        type: 'submit',
        form: formId,
        disabled: Boolean(confirmButtonAttrs.disabled) || !isEditFormValid || isSubmitting,
        loading: isSubmitting,
      })
    "
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <v-form :id="formId" ref="editForm" v-model="isEditFormValid" @submit.prevent="submit">
      <slot />
    </v-form>
    <template #prepend-actions>
      <slot name="prepend-actions" />
    </template>
  </StyledDialog>
</template>
