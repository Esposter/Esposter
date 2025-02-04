<script setup lang="ts">
import type { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";

import { VuetifyComponentMap } from "#shared/services/tableEditor/vuetifyComponent/VuetifyComponentMap";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore<VuetifyComponentItem>();
const { editedItem } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-col cols="12">Preview</v-col>
  <v-col cols="12">
    <div class="border-sm elevation--1" flex items-center w-full justify-center rd aspect-video>
      <component :is="VuetifyComponentMap[editedItem.component]" v-if="editedItem" :="editedItem.props" />
    </div>
  </v-col>
</template>
