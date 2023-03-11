<script setup lang="ts">
import { VuetifyComponent } from "@/models/tableEditor/vuetifyComponent/VuetifyComponent";
import { formRules } from "@/services/vuetify/formRules";
import { useTableEditorStore } from "@/store/tableEditor";
import * as components from "vuetify/components";

const tableEditorStore = useTableEditorStore();
// @NOTE: Fix up this type cast when pinia team fixes type issues
const { editedItem } = storeToRefs(tableEditorStore) as unknown as { editedItem: VuetifyComponent };
const tab = ref<number>();
// Optimise performance and paginate
// because we have too many vuetify components to load in the dropdown all at once
const vuetifyComponents = computed(() => Object.keys(components).map((componentName) => toKebabCase(componentName)));
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
  <v-tabs v-model="tab" bg-color="primary" stacked>
    <v-tab value="tab-1" case="normal!">
      <v-icon icon="mdi-cog" />
      Settings
    </v-tab>
  </v-tabs>

  <v-window v-if="editedItem" v-model="tab">
    <v-window-item value="tab-1">
      <v-container>
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
    </v-window-item>
  </v-window>
</template>
