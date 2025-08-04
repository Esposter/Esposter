<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { leftDrawerOpen, leftDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <div flex flex-col h-full>
    <v-list flex flex-col items-center flex-1 gap-y-4>
      <v-list-item class="text-h5">Components</v-list-item>
      <FlowchartEditorSideBarNodeBase />
    </v-list>
    <v-btn v-if="!leftDrawerOpenAuto" self-end icon="mdi-chevron-double-left" @click="leftDrawerOpen = false" />
  </div>
</template>
