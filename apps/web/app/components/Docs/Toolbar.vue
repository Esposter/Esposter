<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useLayoutStore } from "@/store/layout";

// Only where the sidebar is not open by itself: the way to open it, and search, which would otherwise be inside it
const layoutStore = useLayoutStore();
const { isLeftDrawerOpen, isLeftDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <!-- Opaque, so page content cannot show through while the bar is stuck -->
  <div v-if="!isLeftDrawerOpenAuto" bg-background px-2 py-1 flex gap-2 items-center top-0 sticky z-1>
    <UiIconButton
      label="Show navigation"
      :meaning="UiIconMeaning.Menu"
      :variant="UiButtonVariant.Quiet"
      @click="isLeftDrawerOpen = true"
    />
    <DocsSearch flex-1 />
  </div>
</template>
