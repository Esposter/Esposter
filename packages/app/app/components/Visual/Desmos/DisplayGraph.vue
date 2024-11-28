<script setup lang="ts">
import type { Expression } from "@/models/desmos/Expression";

import { dayjs } from "#shared/services/dayjs";
import AnimateButton from "@/components/Visual/Desmos/AnimateButton.vue";
import WindowControls from "@/components/Visual/Desmos/WindowControls.vue";
import { Colors } from "@/models/desmos/Colors";
import { ignoreWarn } from "@/util/console/ignoreWarn";

interface VisualDesmosDisplayGraphProps {
  expressions: Expression[];
  id: string;
}

const { expressions, id } = defineProps<VisualDesmosDisplayGraphProps>();
const emit = defineEmits<{ clickLeft: [event: MouseEvent]; clickRight: [event: MouseEvent] }>();
const { GraphingCalculator } = useDesmos();
const isDark = useIsDark();
const isAnimating = ref(false);
let calculator: Desmos.Calculator | undefined;
const expressionPanel = ref<HTMLDivElement>();
const componentsToRender = computed<Parameters<typeof h>[]>(() => {
  const WindowControlsComponent: Parameters<typeof h> = [
    WindowControls,
    {
      onClickLeft: (event: MouseEvent) => {
        emit("clickLeft", event);
      },
      onClickRight: (event: MouseEvent) => {
        emit("clickRight", event);
      },
    },
  ];
  return isAnimating.value
    ? [WindowControlsComponent]
    : [[AnimateButton, { onClick: animate }], WindowControlsComponent];
});
const render = useRender(expressionPanel);

const animate = () => {
  if (!calculator) return;
  isAnimating.value = true;
  const savedSettings = { ...calculator.settings };
  calculator.setBlank();
  // Ignore warnings from updateSettings about
  // unsupported extraneous calculator settings which is fine
  ignoreWarn(() => {
    calculator?.updateSettings(savedSettings);
  });

  const drawingTime = dayjs.duration(5, "seconds").asMilliseconds();
  let i = 0;
  const { pause } = useIntervalFn(() => {
    const expression = expressions[i++];
    calculator?.setExpression({ ...expression, color: expression.color ?? Colors.BLACK });
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

watch(componentsToRender, (newComponentsToRender) => {
  render(newComponentsToRender);
});

onMounted(async () => {
  const element = document.querySelector<HTMLDivElement>(`#${id}`);
  if (!element) return;

  calculator = await GraphingCalculator(element, {
    border: false,
    expressionsCollapsed: true,
    invertedColors: isDark.value,
    keypad: false,
    showGrid: false,
    showXAxis: false,
    showYAxis: false,
    trace: false,
  });
  calculator.setExpressions(expressions.map((e) => ({ ...e, color: e.color ?? Colors.BLACK })));
  const newExpressionPanel = document.querySelector<HTMLDivElement>(`#${id} .dcg-exppanel-outer`);
  if (!newExpressionPanel) return;

  expressionPanel.value = newExpressionPanel;
  render(componentsToRender.value);
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
