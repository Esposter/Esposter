<script setup lang="ts">
import type { Expression } from "@/models/desmos/Expression";

import AnimateButton from "@/components/Visual/Desmos/AnimateButton.vue";
import WindowControls from "@/components/Visual/Desmos/WindowControls.vue";
import { Colors } from "@/models/desmos/Colors";
import { ignoreWarn } from "@/util/console/ignoreWarn";
import { getResultAsync, noop, takeOne } from "@esposter/shared";

interface Props {
  expressions: Expression[];
  id: string;
}

const { expressions, id } = defineProps<Props>();
const emit = defineEmits<{ clickLeft: [event: MouseEvent]; clickRight: [event: MouseEvent] }>();
const { onLoaded } = useDesmos();
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
  // Ignore updateSettings warnings about unsupported extraneous calculator settings.
  ignoreWarn(() => {
    calculator?.updateSettings(savedSettings);
  });

  const drawingTime = Temporal.Duration.from({ seconds: 5 }).total("milliseconds");
  let i = 0;
  const { pause } = useIntervalFn(() => {
    const expression = takeOne(expressions, i++);
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

onMounted(() => {
  const element = window.document.getElementById(id) as HTMLDivElement;

  // The script's own load slot calls this and drops what it returns, so the calculator's construction reports
  // Here or nowhere — a graph that never builds leaves the panel empty rather than the page broken
  onLoaded(({ GraphingCalculator }) =>
    getResultAsync(async () => {
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
      calculator.setExpressions(expressions.map((e) => Object.assign(e, { color: e.color ?? Colors.BLACK })));
      const newExpressionPanel = element.querySelector<HTMLDivElement>(".dcg-exppanel-outer");
      if (!newExpressionPanel) return;

      expressionPanel.value = newExpressionPanel;
      render(componentsToRender.value);
    }).match(noop, console.error),
  );
});
</script>

<template>
  <div :id size-full />
</template>

<style scoped>
:deep(.dcg-container) {
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
