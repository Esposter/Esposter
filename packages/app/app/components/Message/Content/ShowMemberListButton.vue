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
  <v-tooltip location="bottom" :text="`${isRightDrawerOpen ? 'Hide' : 'Show'} Member List`">
    <template #activator="{ props }">
      <v-btn
        icon="mdi-account-multiple"
        size="small"
        :="props"
        @click="
          () => {
            if (rightDrawer === RightDrawer.Member) isRightDrawerOpen = !isRightDrawerOpen;
            else {
              rightDrawer = RightDrawer.Member;
              isRightDrawerOpen = true;
            }
          }
        "
      />
    </template>
  </v-tooltip>
</template>
