<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { UiRules } from "#src/services/ui/UiRules";
import { MAX_TAG_NAME_LENGTH, MAX_TAG_VALUE_LENGTH } from "@esposter/db-schema";

const name = defineModel<string>("name", { required: true });
const value = defineModel<string>("value", { required: true });
const emit = defineEmits<{ remove: [] }>();
const nameRules = [UiRules.maxLength(MAX_TAG_NAME_LENGTH)];
const valueRules = [UiRules.maxLength(MAX_TAG_VALUE_LENGTH)];
</script>

<template>
  <div flex gap-2 items-start>
    <UiTextField v-model="name" label="Name" :rules="nameRules" flex-1 />
    <UiTextField v-model="value" label="Value" :rules="valueRules" flex-1>
      <template #trailing>
        <UiIconButton
          label="Remove tag"
          :meaning="UiIconMeaning.Delete"
          :variant="UiButtonVariant.Quiet"
          @click="emit('remove')"
        />
      </template>
    </UiTextField>
  </div>
</template>
