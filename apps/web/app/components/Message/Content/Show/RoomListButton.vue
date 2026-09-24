<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { isLeftDrawerOpen, isLeftDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <UiIconButton
    v-if="!isLeftDrawerOpenAuto"
    label="Show Room List"
    :meaning="UiIconMeaning.Menu"
    :variant="UiButtonVariant.Quiet"
    @click="isLeftDrawerOpen = true"
  />
</template>
