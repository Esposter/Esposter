<script setup lang="ts">
interface VisualDesmosDisplayGraphProps {
  id: string;
  expressions: readonly Desmos.ExpressionState[];
  bounds?: { left?: number; right?: number; bottom?: number; top?: number };
}

const { id, expressions, bounds } = defineProps<VisualDesmosDisplayGraphProps>();
const { GraphingCalculator, Colors } = useDesmos();

onMounted(async () => {
  const element = document.querySelector<HTMLDivElement>(`#${id}`);
  if (!element) return;
  const calculator = await GraphingCalculator(element, {
    border: false,
    colors: Object.fromEntries(Object.entries(Colors).map(([color]) => [color, Colors.BLACK])),
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
  calculator.setExpressions(expressions);
});
</script>

<template>
  <div :id w-full h-full />
</template>

<style scoped lang="scss">
:deep(.dcg-container) {
  background: transparent !important;
}

:deep(.dcg-graphpaper-branding) {
  display: none !important;
}
</style>
