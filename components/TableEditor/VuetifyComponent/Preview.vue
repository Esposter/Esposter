<script setup lang="ts">
import type { VuetifyComponentItem } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { useTableEditorStore } from "@/store/tableEditor";

const { background } = useColors();
const tableEditorStore = useTableEditorStore<VuetifyComponentItem>()();
const { editedItem } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-col v-if="editedItem" cols="12">
    Preview
    <div class="preview" w="full" aspect="video" display="flex" justify="center" items="center" rd>
      <component :is="editedItem.component" :="editedItem.props" />
    </div>
  </v-col>
</template>

<style scoped lang="scss">
.preview {
  background: v-bind(background);
}
</style>
