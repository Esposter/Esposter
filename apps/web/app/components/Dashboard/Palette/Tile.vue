<script setup lang="ts">
import type { VisualType } from "#shared/models/dashboard/data/VisualType";

import { Visual } from "#shared/models/dashboard/data/Visual";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useVisualStore } from "@/store/dashboard/visual";
import { startExternalDrag } from "vue-grid-layout-headless";

interface Props {
  title: string;
  type: VisualType;
}

const { title, type } = defineProps<Props>();
const visualStore = useVisualStore();
const { addVisual, createVisual } = visualStore;
const button = useTemplateRef("button");
// A press that moves is a drag that drops the visual where it is released, and a press that does not is a click that adds
// The first free cell, so the drag never adds a second visual through its click
onClickExceptDrag(
  computed(() => button.value?.element),
  () => {
    createVisual(type);
  },
);
</script>

<template>
  <UiButton
    ref="button"
    :style="{ touchAction: 'none' }"
    :variant="UiButtonVariant.Quiet"
    @pointerdown="
      (event) => {
        startExternalDrag(event, new Visual({ type }), (cell) => addVisual(type, cell));
      }
    "
  >
    <UiIcon :meaning="UiIconMeaning.Chart" />
    {{ title }}
  </UiButton>
</template>
