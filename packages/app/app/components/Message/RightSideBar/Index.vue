<script setup lang="ts">
import { RightDrawerComponentMap } from "@/services/message/RightDrawerComponentMap";
import { useLayoutStore } from "@/store/message/layout";

const layoutStore = useLayoutStore();
const { rightDrawer } = storeToRefs(layoutStore);
</script>

<template>
  <div flex flex-col h-full>
    <component :is="RightDrawerComponentMap[rightDrawer]" />
  </div>
</template>
