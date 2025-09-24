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
  <v-tooltip location="bottom" :text="`${rightDrawerOpen ? 'Hide' : 'Show'} Member List`">
    <template #activator="{ props }">
      <v-btn
        icon="mdi-account-multiple"
        size="small"
        :="props"
        @click="
          () => {
            if (rightDrawer === RightDrawer.Member) rightDrawerOpen = !rightDrawerOpen;
            else {
              rightDrawer = RightDrawer.Member;
              rightDrawerOpen = true;
            }
          }
        "
      />
    </template>
  </v-tooltip>
</template>
