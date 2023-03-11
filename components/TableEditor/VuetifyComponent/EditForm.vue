<script setup lang="ts">
import { VuetifyComponent } from "@/models/tableEditor/vuetifyComponent/VuetifyComponent";
import { formRules } from "@/services/vuetify/formRules";
import { useItemStore } from "@/store/tableEditor/item";
import * as components from "vuetify/components";

const itemStore = useItemStore();
// @NOTE: Fix up this type cast when pinia team fixes type issues
const { editedItem } = storeToRefs(itemStore) as unknown as { editedItem: VuetifyComponent };
const tab = ref<number>();
const componentNames = computed(() => Object.keys(components).map((componentName) => toKebabCase(componentName)));
</script>

<template>
  <v-tabs v-model="tab" bg-color="primary" stacked>
    <v-tab value="tab-1" case="normal!">
      <v-icon icon="mdi-table-settings" />
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
              :items="componentNames"
              label="Component"
              :rules="[formRules.required]"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-window-item>
  </v-window>
</template>
