<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { isLeftDrawerOpen, isLeftDrawerOpenAuto, isRightDrawerOpen, isRightDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <!-- Three columns, so the type selectors stay centred whichever drawer buttons show -->
  <header grid w-full items-center grid-cols="[1fr_auto_1fr]">
    <UiIconButton
      v-if="!isLeftDrawerOpenAuto"
      label="Store"
      :meaning="UiIconMeaning.Store"
      :variant="UiButtonVariant.Quiet"
      justify-self-start
      @click="isLeftDrawerOpen = true"
    />
    <ClickerModelItemTypeSelectors col-start-2 />
    <UiIconButton
      v-if="!isRightDrawerOpenAuto"
      label="Inventory"
      :meaning="UiIconMeaning.Inventory"
      :variant="UiButtonVariant.Quiet"
      col-start-3
      justify-self-end
      @click="isRightDrawerOpen = true"
    />
  </header>
</template>
