<script setup lang="ts">
import { ITEM_NAME_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { UiRules } from "@/services/ui/UiRules";

const modelValue = defineModel<string>({ required: true });
const nameRules = [UiRules.required(), UiRules.maxLength(ITEM_NAME_MAX_LENGTH)];
</script>

<template>
  <UiTextField v-model="modelValue" :counter="ITEM_NAME_MAX_LENGTH" label="Name" :rules="nameRules" />
</template>
