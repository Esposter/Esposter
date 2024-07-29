<script setup lang="ts">
import AnimateButton from "@/components/Visual/Desmos/AnimateButton.vue";
import { Colors } from "@/models/desmos/Colors";
import type { Expression } from "@/models/desmos/Expression";
import { dayjs } from "@/services/dayjs";
import { ignoreWarn } from "@/util/console/ignoreWarn";

interface VisualDesmosDisplayGraphProps {
  id: string;
  expressions: Expression[];
}

const { id, expressions } = defineProps<VisualDesmosDisplayGraphProps>();

const { GraphingCalculator } = useDesmos();
const isDark = useIsDark();
const isAnimating = ref(false);
let calculator: Desmos.Calculator;
const expressionPanelOuter = ref<HTMLDivElement | null>(null);
const render = useRender(expressionPanelOuter);

const animate = () => {
  if (!calculator) return;
  isAnimating.value = true;
  const savedSettings = { ...calculator.settings };
  calculator.setBlank();
  // Ignore warnings from updateSettings about
  // unsupported extraneous calculator settings which is fine
  ignoreWarn(() => {
    calculator.updateSettings(savedSettings);
  });

  const drawingTime = dayjs.duration(5, "seconds").asMilliseconds();
  let i = 0;
  const { pause } = useIntervalFn(() => {
    const expression = expressions[i++];
    calculator.setExpression({ ...expression, color: expression.color ?? Colors.BLACK });
    if (i === expressions.length) {
      pause();
      isAnimating.value = false;
    }
  }, drawingTime / expressions.length);
};

watch(isDark, (newIsDark) => {
  if (!calculator) return;
  calculator.updateSettings({ invertedColors: newIsDark });
});

watch(isAnimating, (newIsAnimating) => {
  if (newIsAnimating) render(null);
  else render(AnimateButton, { onClick: animate });
});

onMounted(async () => {
  const element = document.querySelector<HTMLDivElement>(`#${id}`);
  if (!element) return;
  calculator = await GraphingCalculator(element, {
    border: false,
    expressionsCollapsed: true,
    keypad: false,
    invertedColors: isDark.value,
    showGrid: false,
    showXAxis: false,
    showYAxis: false,
    trace: false,
  });
  calculator.setExpressions(expressions.map((e) => ({ ...e, color: e.color ?? Colors.BLACK })));
  expressionPanelOuter.value = document.querySelector<HTMLDivElement>(".dcg-exppanel-outer");
  render(AnimateButton, { onClick: animate });
});
</script>

<template>
  <div :id w-full h-full />
</template>

<style scoped lang="scss">
:deep(.dcg-container) {
  background: transparent !important;
  cursor: move;

  > div:first-of-type {
    position: relative;
    z-index: 1;
  }
}

:deep(.dcg-graphpaper-branding) {
  display: none !important;
}
</style>
