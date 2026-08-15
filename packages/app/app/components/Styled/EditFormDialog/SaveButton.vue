<script setup lang="ts">
interface SaveButtonProps {
  formId: string;
  isSavable: boolean;
}

const { formId, isSavable } = defineProps<SaveButtonProps>();
const buttonProps = computed(() => ({ disabled: !isSavable }));
</script>

<template>
  <StyledTooltipIconButton :button-props :form="formId" icon="mdi-content-save" text="Save & Close" type="submit" />
</template>
