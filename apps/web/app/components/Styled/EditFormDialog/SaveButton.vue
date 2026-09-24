<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  formId: string;
  isSavable: boolean;
}

const { formId, isSavable } = defineProps<Props>();
</script>

<template>
  <UiIconButton
    :disabled="!isSavable"
    :form="formId"
    label="Save & Close"
    :meaning="UiIconMeaning.Save"
    type="submit"
    :variant="UiButtonVariant.Quiet"
  />
</template>
