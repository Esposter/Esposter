<script setup lang="ts">
import { ITEM_NAME_MAX_LENGTH } from "#shared/services/resource/itemConstants";

const modelValue = defineModel<string>();
const rules = useVRules();
const nameRules = computed(() => [rules.required(), rules.maxLength(ITEM_NAME_MAX_LENGTH)]);
</script>

<template>
  <v-col cols="12">
    <v-text-field v-model="modelValue" label="Name" :rules="nameRules" />
  </v-col>
</template>
