<script setup lang="ts">
import { RightDrawerComponentMap } from "@/services/message/RightDrawerComponentMap";
import { useLayoutStore } from "@/store/message/ui/layout";

const layoutStore = useLayoutStore();
const { rightDrawer } = storeToRefs(layoutStore);
</script>

<template>
  <div h-full flex flex-col>
    <component :is="RightDrawerComponentMap[rightDrawer]" />
  </div>
</template>
