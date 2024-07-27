<script setup lang="ts">
import { Colors } from "@/models/desmos/Colors";
import type { Expression } from "@/models/desmos/Expression";

interface VisualDesmosDisplayGraphProps {
  id: string;
  expressions: Expression[];
  bounds?: { left?: number; right?: number; bottom?: number; top?: number };
}

const { id, expressions, bounds } = defineProps<VisualDesmosDisplayGraphProps>();
const { GraphingCalculator } = useDesmos();

onMounted(async () => {
  const element = document.querySelector<HTMLDivElement>(`#${id}`);
  if (!element) return;
  const calculator = await GraphingCalculator(element, {
    border: false,
    expressions: false,
    keypad: false,
    settingsMenu: false,
    showGrid: false,
    showXAxis: false,
    showYAxis: false,
    trace: false,
    zoomButtons: false,
  });
  if (bounds) calculator.setMathBounds(bounds);
  calculator.setExpressions(expressions.map((e) => ({ ...e, color: e.color ?? Colors.BLACK })));
});
</script>

<template>
  <div :id w-full h-full />
</template>

<style scoped lang="scss">
:deep(.dcg-container) {
  background: transparent !important;
  cursor: grab;

  :active {
    cursor: grabbing;
  }
}

:deep(.dcg-graphpaper-branding) {
  display: none !important;
}
</style>
