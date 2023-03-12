<script setup lang="ts">
import { VuetifyComponent } from "@/models/tableEditor/vuetifyComponent/VuetifyComponent";
import { useTableEditorStore } from "@/store/tableEditor";

const { background } = useColors();
const tableEditorStore = useTableEditorStore();
// @NOTE: Fix up this type cast when pinia team fixes type issues
const { editedItem } = storeToRefs(tableEditorStore) as unknown as { editedItem: Ref<VuetifyComponent | null> };
</script>

<template>
  <v-container v-if="editedItem" max-h="70vh" overflow-y="auto">
    <v-row>
      <v-col>
        <div class="preview" w="full" aspect="video" display="flex" justify="center" items="center" rd>
          <component :is="editedItem.component" :="editedItem.props" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="scss">
.preview {
  background: v-bind(background);
}
</style>
