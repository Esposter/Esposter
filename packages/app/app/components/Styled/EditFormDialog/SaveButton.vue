<script setup lang="ts">
interface SaveButtonProps {
  formId: string;
  isSavable: boolean;
}

const { formId, isSavable } = defineProps<SaveButtonProps>();
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ disabled: !isSavable }"
    :form="formId"
    icon="mdi-content-save"
    text="Save & Close"
    type="submit"
  />
</template>
