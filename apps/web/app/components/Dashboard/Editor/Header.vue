<script setup lang="ts">
import { listVisuals } from "#shared/services/dashboard/listVisuals";
import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useVisualStore } from "@/store/dashboard/visual";

const visualStore = useVisualStore();
const { createVisual } = visualStore;
const { visuals } = storeToRefs(visualStore);
// Every visual of the tree, a group's included, since the canvas holds them all
const visualCount = computed(() => listVisuals(visuals.value).length);
</script>

<!-- The bar says how much the canvas holds, and leads with the one thing to do on it -->
<template>
  <div px-3 py-2 flex gap-2 ui-bar items-center>
    <p text-sm text-muted flex-1 min-w-0 truncate>{{ visualCount }} {{ pluralize("visual", visualCount) }}</p>
    <UiButton :variant="UiButtonVariant.Accent" @click="createVisual()">
      <UiIcon :meaning="UiIconMeaning.Create" />
      Add visual
    </UiButton>
  </div>
</template>
