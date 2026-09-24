<script setup lang="ts">
import { ITEM_NAME_MAX_LENGTH } from "#shared/services/resource/item/constants";

const modelValue = defineModel<string>();
const rules = useVRules();
const nameRules = computed(() => [rules.required(), rules.maxLength(ITEM_NAME_MAX_LENGTH)]);
</script>

<!-- Vuetify's field while the edit dialog's form counts Vuetify's fields: the schema-forms stage moves the form whole -->
<template>
  <v-text-field v-model="modelValue" label="Name" :rules="nameRules" />
</template>
