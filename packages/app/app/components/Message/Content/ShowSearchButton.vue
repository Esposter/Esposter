<script setup lang="ts">
import { RightDrawer } from "@/models/message/RightDrawer";
import { useLayoutStore } from "@/store/layout";
import { useLayoutStore as useMessageLayoutStore } from "@/store/message/layout";

const layoutStore = useLayoutStore();
const { rightDrawerOpen } = storeToRefs(layoutStore);
const messageLayoutStore = useMessageLayoutStore();
const { rightDrawer } = storeToRefs(messageLayoutStore);
</script>

<template>
  <v-tooltip location="bottom" text="Search">
    <template #activator="{ props }">
      <v-btn
        icon="mdi-magnify"
        size="small"
        :="props"
        @click="
          () => {
            if (rightDrawer === RightDrawer.Search) rightDrawerOpen = !rightDrawerOpen;
            else {
              rightDrawer = RightDrawer.Search;
              rightDrawerOpen = true;
            }
          }
        "
      />
    </template>
  </v-tooltip>
</template>
