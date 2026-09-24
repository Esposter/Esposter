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
  <!-- The one thing the dialog is for, so it is the accent's and says what it does rather than showing a mark alone -->
  <UiButton :disabled="!isSavable" :form="formId" type="submit" :variant="UiButtonVariant.Accent">
    <UiIcon :meaning="UiIconMeaning.Save" />
    Save
  </UiButton>
</template>
