<script setup lang="ts">
import type { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { VuetifyComponentMap } from "#shared/services/tableEditor/vuetifyComponent/VuetifyComponentMap";
import { formRules } from "@/services/vuetify/formRules";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore<VuetifyComponentItem>();
const { editedItem } = storeToRefs(tableEditorStore);
// Optimise performance and paginate because we have too many vuetify components to load in the dropdown all at once
const vuetifyComponentKeys = computed(() => Object.keys(VuetifyComponentMap));
const vuetifyComponentKeysCursor = ref(Math.min(DEFAULT_READ_LIMIT, vuetifyComponentKeys.value.length));
const displayVuetifyComponentKeys = computed(() =>
  vuetifyComponentKeys.value.slice(0, vuetifyComponentKeysCursor.value),
);
const onIntersect = (isIntersecting: boolean) => {
  if (!isIntersecting) return;
  vuetifyComponentKeysCursor.value = Math.min(
    vuetifyComponentKeysCursor.value + DEFAULT_READ_LIMIT,
    vuetifyComponentKeys.value.length,
  );
};
</script>

<template>
  <v-col v-if="editedItem" cols="12">
    <v-autocomplete
      v-model="editedItem.component"
      label="Component"
      :items="displayVuetifyComponentKeys"
      :rules="[formRules.required]"
      @update:menu="
        (value) => {
          if (!value) vuetifyComponentKeysCursor = Math.min(DEFAULT_READ_LIMIT, vuetifyComponentKeys.length);
        }
      "
    >
      <template #append-item>
        <div v-intersect="onIntersect" />
      </template>
    </v-autocomplete>
  </v-col>
</template>
