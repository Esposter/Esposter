<script setup lang="ts">
import type { VuetifyComponentItem } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItem";

import { VuetifyComponentMap } from "@/services/tableEditor/vuetifyComponent/VuetifyComponentMap";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore<VuetifyComponentItem>();
const { editedItem } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-col cols="12">Preview</v-col>
  <v-col cols="12">
    <div class="border-sm elevation--1" flex items-center w-full justify-center rd aspect-video>
      <!-- @TODO: Remove this cast once vuetify/components import is fixed -->
      <component
        :is="VuetifyComponentMap[editedItem.component as keyof typeof VuetifyComponentMap]"
        v-if="editedItem"
        :="editedItem?.props"
      />
    </div>
  </v-col>
</template>
