<script setup lang="ts">
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useLayoutStore } from "@/store/layout";

interface Props {
  // The right drawer's button rather than the left's
  isEnd?: true;
  label: string;
  meaning: UiIconMeaning;
}

const { isEnd, label, meaning } = defineProps<Props>();
const layoutStore = useLayoutStore();
const { isDesktop, isLeftDrawerOpen, isRightDrawerOpen } = storeToRefs(layoutStore);
</script>

<!-- A wide screen docks every drawer open, so the button that opens one exists only on a narrow screen -->
<template>
  <UiIconButton
    v-if="!isDesktop"
    :label
    :meaning
    :variant="UiButtonVariant.Quiet"
    @click="
      () => {
        if (isEnd) isRightDrawerOpen = true;
        else isLeftDrawerOpen = true;
      }
    "
  />
</template>
