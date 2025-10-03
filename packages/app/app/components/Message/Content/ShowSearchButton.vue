<script setup lang="ts">
import { RightDrawer } from "@/models/message/RightDrawer";
import { useLayoutStore } from "@/store/layout";
import { useLayoutStore as useMessageLayoutStore } from "@/store/message/layout";

const layoutStore = useLayoutStore();
const { isRightDrawerOpen } = storeToRefs(layoutStore);
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
            if (rightDrawer === RightDrawer.Search) isRightDrawerOpen = !isRightDrawerOpen;
            else {
              rightDrawer = RightDrawer.Search;
              isRightDrawerOpen = true;
            }
          }
        "
      />
    </template>
  </v-tooltip>
</template>
