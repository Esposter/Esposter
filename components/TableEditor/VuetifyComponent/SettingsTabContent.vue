<script setup lang="ts">
import { VuetifyComponent } from "@/models/tableEditor/vuetifyComponent/VuetifyComponent";
import { VuetifyComponentMap } from "@/services/vuetify/constants";
import { formRules } from "@/services/vuetify/formRules";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
// @NOTE: Fix up this type cast when pinia team fixes type issues
const { editedItem } = storeToRefs(tableEditorStore) as unknown as { editedItem: VuetifyComponent };
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
  <v-container max-h="70vh" overflow-y="auto">
    <v-row>
      <v-col>
        <v-text-field v-model="editedItem.name" label="Name" :rules="[formRules.required]" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
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
    </v-row>
  </v-container>
</template>
