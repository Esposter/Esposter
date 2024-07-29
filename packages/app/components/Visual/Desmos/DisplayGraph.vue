<script setup lang="ts">
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
const { surface } = useColors();
const isAnimating = ref(false);
let calculator: Desmos.Calculator;

const animateDrawing = () => {
  if (!calculator) return;
  isAnimating.value = true;
  const savedSettings = { ...calculator.settings };
  calculator.setBlank();
  // Ignore warnings from updateSettings
  // about unsupported extraneous calculator settings which is fine
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
});
</script>

<template>
  <div :id w-full h-full />
  <v-tooltip v-if="!isAnimating" location="left center" text="Animate">
    <template #activator="{ props }">
      <v-btn
        :style="{ backgroundColor: surface }"
        fixed="!"
        bg-surface
        right-1
        bottom-2
        rd-1="!"
        icon="mdi-draw"
        size="small"
        :="props"
        @click="animateDrawing"
      />
    </template>
  </v-tooltip>
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
