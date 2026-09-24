<script setup lang="ts">
import { RightDrawerComponentMap } from "@/services/message/RightDrawerComponentMap";
import { useMessageLayoutStore } from "@/store/message/ui/layout";

const messageLayoutStore = useMessageLayoutStore();
const { rightDrawer, splitRightDrawer } = storeToRefs(messageLayoutStore);
</script>

<!-- Split view renders the pinned pane beside the drawer's own rather than a second drawer: both share the
     drawer's width, its resize handle and its breakpoint behaviour, where a second drawer would need every one
     of those again and could be dragged out of agreement with this one -->
<template>
  <div flex h-full ui-body>
    <div v-if="splitRightDrawer" flex flex-1 flex-col h-full of-hidden>
      <component :is="RightDrawerComponentMap[splitRightDrawer]" />
    </div>
    <div v-if="splitRightDrawer" bg-divider shrink-0 w="[var(--ui-border-width)]" />
    <div flex flex-1 flex-col h-full of-hidden>
      <component :is="RightDrawerComponentMap[rightDrawer]" />
    </div>
  </div>
</template>
