<script setup lang="ts">
import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useVisualStore } from "@/store/dashboard/visual";

const visualStore = useVisualStore();
const { createVisual } = visualStore;
const { visuals } = storeToRefs(visualStore);
</script>

<!-- The bar says how much the canvas holds and leads with the one thing to do on it -->
<template>
  <div px-3 py-2 flex gap-2 ui-bar items-center>
    <p text-sm text-muted flex-1 min-w-0 truncate>{{ visuals.length }} {{ pluralize("visual", visuals.length) }}</p>
    <UiButton :variant="UiButtonVariant.Accent" @click="createVisual()">
      <UiIcon :meaning="UiIconMeaning.Create" />
      Add visual
    </UiButton>
  </div>
</template>
