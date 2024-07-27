<script setup lang="ts">
import type { Expression } from "@/models/desmos/Expression";

interface VisualDesmosDisplayGraphProps {
  id: string;
  expressions: Expression[];
}

const { id, expressions } = defineProps<VisualDesmosDisplayGraphProps>();
const { GraphingCalculator } = useDesmos();
const isDark = useIsDark();
const { text } = useColors();
let calculator: Desmos.Calculator;

watch(isDark, () => {
  if (!calculator) return;
  calculator.setExpressions(expressions.map((e) => ({ ...e, color: e.color ?? text.value })));
});

onMounted(async () => {
  const element = document.querySelector<HTMLDivElement>(`#${id}`);
  if (!element) return;
  calculator = await GraphingCalculator(element, {
    border: false,
    expressions: false,
    keypad: false,
    showGrid: false,
    showXAxis: false,
    showYAxis: false,
    trace: false,
  });
  calculator.setExpressions(expressions.map((e) => ({ ...e, color: e.color ?? text.value })));
});
</script>

<template>
  <div :id w-full h-full />
</template>

<style scoped lang="scss">
:deep(.dcg-container) {
  background: transparent !important;
  cursor: move;
}

:deep(.dcg-graphpaper-branding) {
  display: none !important;
}
</style>
