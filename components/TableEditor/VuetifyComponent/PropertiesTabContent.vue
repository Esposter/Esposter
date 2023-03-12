<script setup lang="ts">
import { VuetifyComponent } from "@/models/tableEditor/vuetifyComponent/VuetifyComponent";
import { VuetifyComponentMap } from "@/services/vuetify/constants";
import { formRules } from "@/services/vuetify/formRules";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
// @NOTE: Fix up this type cast when pinia team fixes type issues
const { editedItem } = storeToRefs(tableEditorStore) as unknown as { editedItem: Ref<VuetifyComponent> };
const props = computed<Record<string, unknown>>(() => VuetifyComponentMap[editedItem.value.component].props);
</script>

<template>
  <v-container max-h="70vh" overflow-y="auto">
    <v-row>
      <v-col>
        <v-text-field v-model="editedItem.name" label="Name" :rules="[formRules.required]" />
      </v-col>
    </v-row>
    <v-row>
      <v-col> </v-col>
    </v-row>
  </v-container>
</template>
