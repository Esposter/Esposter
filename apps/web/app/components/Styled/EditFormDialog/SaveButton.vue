<script setup lang="ts">
interface Props {
  formId: string;
  isSavable: boolean;
}

const { formId, isSavable } = defineProps<Props>();
const buttonProps = computed(() => ({ disabled: !isSavable }));
</script>

<template>
  <StyledTooltipIconButton :button-props :form="formId" icon="mdi-content-save" text="Save & Close" type="submit" />
</template>
