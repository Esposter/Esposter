<script setup lang="ts">
import type { VuetifyComponentItem } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import type { VuetifyComponentItemType } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
import { VuetifyComponentMap } from "@/services/tableEditor/vuetifyComponent/constants";
import { formRules } from "@/services/vuetify/formRules";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore<VuetifyComponentItemType, VuetifyComponentItem>()();
const { editedItem } = storeToRefs(tableEditorStore);
// Optimise performance and paginate
// because we have too many vuetify components to load in the dropdown all at once
const vuetifyComponents = computed(() => Object.keys(VuetifyComponentMap));
const vuetifyComponentsCursor = ref(Math.min(READ_LIMIT, vuetifyComponents.value.length));
const displayVuetifyComponents = computed(() => vuetifyComponents.value.slice(0, vuetifyComponentsCursor.value));
const onIntersect = (isIntersecting: boolean) => {
  if (isIntersecting)
    vuetifyComponentsCursor.value = Math.min(
      vuetifyComponentsCursor.value + READ_LIMIT,
      vuetifyComponents.value.length
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
          if (!value) vuetifyComponentsCursor = Math.min(READ_LIMIT, vuetifyComponents.length);
        }
      "
    >
      <template #append-item>
        <div v-intersect="onIntersect" />
      </template>
    </v-autocomplete>
  </v-col>
</template>
