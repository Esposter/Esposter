<script setup lang="ts">
import { RightDrawerComponentMap } from "@/services/message/RightDrawerComponentMap";
import { useLayoutStore } from "@/store/message/layout";

const layoutStore = useLayoutStore();
const { rightDrawer } = storeToRefs(layoutStore);
</script>

<template>
  <component :is="RightDrawerComponentMap[rightDrawer]" />
</template>
