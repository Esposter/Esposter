<script setup lang="ts">
import type { DialogActivatorSlotProps } from "@/components/Styled/DialogActivatorSlotProps";
import type { SubmitEventPromise } from "vuetify";
import type { VBtn, VCard, VForm } from "vuetify/components";

import { mergeProps } from "vue";
// @TODO: https://github.com/vuejs/core/issues/11371
interface Props {
  cardProps?: VCard["$props"];
  confirmButtonAttrs?: VBtn["$attrs"];
  confirmButtonProps?: VBtn["$props"];
}

defineSlots<{
  activator?: (props: DialogActivatorSlotProps) => VNode;
  default?: () => VNode;
  "prepend-actions"?: () => VNode;
  "prepend-confirm"?: () => VNode;
}>();
const modelValue = defineModel<boolean>({ default: false });
const { cardProps, confirmButtonAttrs = {}, confirmButtonProps = {} } = defineProps<Props>();
const emit = defineEmits<{ submit: [event: SubmitEventPromise, onComplete: (isSuccessful?: boolean) => void] }>();
const editForm = ref<InstanceType<typeof VForm>>();
const isEditFormValid = ref(true);
const isSubmitting = ref(false);
const formId = useId();
const mergedConfirmButtonAttrs = computed(() =>
  mergeProps(confirmButtonAttrs, {
    disabled: Boolean(confirmButtonAttrs.disabled) || !isEditFormValid.value || isSubmitting.value,
    form: formId,
    loading: isSubmitting.value,
    type: "submit",
  }),
);
const submit = (event: SubmitEventPromise) => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  // A failed submit keeps the dialog open so the user can retry without losing their draft
  emit("submit", event, (isSuccessful = true) => {
    if (isSuccessful) modelValue.value = false;
    isSubmitting.value = false;
  });
};

defineExpose({ editForm, isEditFormValid });
</script>

<template>
  <StyledDialog v-model="modelValue" :card-props :confirm-button-props :confirm-button-attrs="mergedConfirmButtonAttrs">
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <v-form :id="formId" ref="editForm" v-model="isEditFormValid" flex flex-col gap-y-4 @submit.prevent="submit">
      <slot />
    </v-form>
    <!-- Guarded, not forwarded outright: the shell reads the presence of these slots to decide whether there is an
      actions row at all, so an unconditional forward hands it a slot the consumer never passed. -->
    <template v-if="$slots['prepend-actions']" #prepend-actions>
      <slot name="prepend-actions" />
    </template>
    <template v-if="$slots['prepend-confirm']" #prepend-confirm>
      <slot name="prepend-confirm" />
    </template>
  </StyledDialog>
</template>
