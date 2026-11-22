<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { UiRules } from "#src/services/ui/UiRules";

interface Props {
  index: number;
  // The poll's minimum of options is the last one standing, which cannot be removed
  isRemoveDisabled?: true | undefined;
}

const label = defineModel<string>({ required: true });
defineProps<Props>();
const emit = defineEmits<{ remove: [] }>();
const requiredRules = [UiRules.required()];
</script>

<template>
  <UiTextField v-model="label" :label="`Option ${index + 1}`" :rules="requiredRules">
    <template #trailing>
      <UiIconButton
        :disabled="isRemoveDisabled"
        label="Remove option"
        :meaning="UiIconMeaning.Remove"
        :variant="UiButtonVariant.Quiet"
        @click="emit('remove')"
      />
    </template>
  </UiTextField>
</template>
