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
      <!-- @vue-expect-error TS2590: Expression produces a union type that is too complex to represent. -->
      <component :is="VuetifyComponentMap[editedItem.component]" v-if="editedItem" :="editedItem.props" />
    </div>
  </v-col>
</template>
