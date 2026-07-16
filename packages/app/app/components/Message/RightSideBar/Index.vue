<script setup lang="ts">
import { RightDrawerComponentMap } from "@/services/message/RightDrawerComponentMap";
import { useMessageLayoutStore } from "@/store/message/ui/layout";

const messageLayoutStore = useMessageLayoutStore();
const { rightDrawer } = storeToRefs(messageLayoutStore);
</script>

<template>
  <div flex flex-col h-full>
    <component :is="RightDrawerComponentMap[rightDrawer]" />
  </div>
</template>
