<script setup lang="ts">
import { NodeType } from "#shared/models/flowchartEditor/data/NodeType";
import { NodeTypeMap } from "@/services/flowchartEditor/NodeTypeMap";
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { leftDrawerOpen, leftDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <div flex flex-col h-full>
    <v-list flex flex-col items-center flex-1 gap-y-4>
      <v-list-item class="text-h5">Components</v-list-item>
      <template v-for="nodeType of Object.values(NodeType)" :key="nodeType">
        <component :is="NodeTypeMap[nodeType].preview" />
      </template>
    </v-list>
    <v-btn v-if="!leftDrawerOpenAuto" self-end icon="mdi-chevron-double-left" @click="leftDrawerOpen = false" />
  </div>
</template>
