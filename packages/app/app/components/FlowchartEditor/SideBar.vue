<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { leftDrawerOpen, leftDrawerOpenAuto } = storeToRefs(layoutStore);
const { onDragStart } = useDragAndDrop();
const { text } = useColors();
</script>

<template>
  <div flex flex-col h-full>
    <v-list flex flex-col items-center flex-1 gap-y-4>
      <v-list-item class="text-h5">Components</v-list-item>
      <v-list-item
        class="bg-surface vue-flow__node-default"
        cursor-pointer
        :draggable="true"
        @dragstart="onDragStart($event)"
      />
    </v-list>
    <v-btn v-if="!leftDrawerOpenAuto" self-end icon="mdi-chevron-double-left" @click="leftDrawerOpen = false" />
  </div>
</template>

<style scoped lang="scss">
.vue-flow__node-default {
  border: $border-width-root $border-style-root v-bind(text);
}

:deep(.v-list-item__content) {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
