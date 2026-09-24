<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useVisualStore } from "@/store/dashboard/visual";

const visualStore = useVisualStore();
const { createVisual } = visualStore;
</script>

<template>
  <div px-3 py-2 flex gap-2 ui-bar items-center justify-end>
    <UiButton :variant="UiButtonVariant.Accent" @click="createVisual">
      <UiIcon :meaning="UiIconMeaning.Create" />
      Add visual
    </UiButton>
  </div>
</template>
