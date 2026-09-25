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
const { onLoaded, status } = useDesmos();
const isDark = useIsDark();
const isAnimating = ref(false);
// Whether the calculator has drawn, or failed to: the script's own status covers it never arriving
const isDrawn = ref(false);
const isFailed = ref(false);
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
  let expressionIndex = 0;
  const { pause } = useIntervalFn(() => {
    const expression = takeOne(expressions, expressionIndex++);
    calculator?.setExpression({ ...expression, color: expression.color ?? Colors.Black });
    if (expressionIndex === expressions.length) {
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
  // Here or nowhere — a graph that never builds shows the failure in its place rather than breaking the page
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
      calculator.setExpressions(
        expressions.map((expression) => Object.assign(expression, { color: expression.color ?? Colors.Black })),
      );
      isDrawn.value = true;
      const newExpressionPanel = element.querySelector<HTMLDivElement>(".dcg-exppanel-outer");
      if (!newExpressionPanel) return;

      expressionPanel.value = newExpressionPanel;
      render(componentsToRender.value);
    }).match(noop, (error) => {
      console.error(error);
      isFailed.value = true;
    }),
  );
});
</script>

<!-- The calculator mounts into the element named by its id, so the drawing's shape stands over it until it has
  drawn -->
<template>
  <div size-full relative>
    <div :id size-full />
    <UiErrorState
      v-if="isFailed || status === 'error'"
      error="The drawing could not be loaded."
      inset-0
      absolute
      @retry="reloadNuxtApp()"
    />
    <UiSkeleton v-else-if="!isDrawn" inset-0 absolute />
  </div>
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
