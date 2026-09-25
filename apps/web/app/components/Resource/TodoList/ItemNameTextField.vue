<script setup lang="ts">
import { ITEM_NAME_MAX_LENGTH } from "#shared/services/resource/item/constants";

const modelValue = defineModel<string>({ required: true });
const rules = useVRules();
const nameRules = computed(() => [rules.required(), rules.maxLength(ITEM_NAME_MAX_LENGTH)]);
</script>

<template>
  <UiTextField v-model="modelValue" :counter="ITEM_NAME_MAX_LENGTH" label="Name" :rules="nameRules" />
</template>
