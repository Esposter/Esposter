<script setup lang="ts">
import type { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { useLayoutStore } from "#src/store/layout";

interface Props {
  // The right drawer's button rather than the left's
  isEnd?: true | undefined;
  label: string;
  meaning: UiIconMeaning;
}

defineProps<Props>();
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
