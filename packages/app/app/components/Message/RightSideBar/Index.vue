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
  <div flex h-full>
    <div v-if="splitRightDrawer" flex flex-1 flex-col h-full overflow-hidden>
      <component :is="RightDrawerComponentMap[splitRightDrawer]" />
    </div>
    <v-divider v-if="splitRightDrawer" vertical />
    <div flex flex-1 flex-col h-full overflow-hidden>
      <component :is="RightDrawerComponentMap[rightDrawer]" />
    </div>
  </div>
</template>
