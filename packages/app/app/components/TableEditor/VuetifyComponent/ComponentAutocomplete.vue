<script setup lang="ts">
import type { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { VuetifyComponentMap } from "#shared/services/tableEditor/vuetifyComponent/VuetifyComponentMap";
import { formRules } from "@/services/vuetify/formRules";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore<VuetifyComponentItem>();
const { editedItem } = storeToRefs(tableEditorStore);
// Optimise performance and paginate
// because we have too many vuetify components to load in the dropdown all at once
const vuetifyComponents = computed(() => Object.keys(VuetifyComponentMap));
const vuetifyComponentsCursor = ref(Math.min(DEFAULT_READ_LIMIT, vuetifyComponents.value.length));
const displayVuetifyComponents = computed(() => vuetifyComponents.value.slice(0, vuetifyComponentsCursor.value));
const onIntersect = (isIntersecting: boolean) => {
  if (isIntersecting)
    vuetifyComponentsCursor.value = Math.min(
      vuetifyComponentsCursor.value + DEFAULT_READ_LIMIT,
      vuetifyComponents.value.length,
    );
};
</script>

<template>
  <v-col v-if="editedItem" cols="12">
    <v-autocomplete
      v-model="editedItem.component"
      label="Component"
      :items="displayVuetifyComponents"
      :rules="[formRules.required]"
      @update:menu="
        (value) => {
          if (!value) vuetifyComponentsCursor = Math.min(DEFAULT_READ_LIMIT, vuetifyComponents.length);
        }
      "
    >
      <template #append-item>
        <div v-intersect="onIntersect" />
      </template>
    </v-autocomplete>
  </v-col>
</template>
