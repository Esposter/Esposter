<script setup lang="ts">
import type { Expression } from "@/models/desmos/Expression";

import AnimateButton from "@/components/Visual/Desmos/AnimateButton.vue";
import WindowControls from "@/components/Visual/Desmos/WindowControls.vue";
import { withDefaultExpressionColor } from "@/services/visual/withDefaultExpressionColor";
import { useThemeModeStore } from "@/store/ui/themeMode";
import { ignoreWarn } from "@/util/console/ignoreWarn";
import { takeOne } from "@esposter/shared";

interface Props {
  expressions: Expression[];
  id: string;
}

const { expressions, id } = defineProps<Props>();
const emit = defineEmits<{ clickLeft: [event: MouseEvent]; clickRight: [event: MouseEvent] }>();
const { onLoaded, status } = useDesmos();
const themeModeStore = useThemeModeStore();
const { isDark } = storeToRefs(themeModeStore);
const isAnimating = ref(false);
// Whether the calculator has drawn: the drawing's shape stands over the element until then
const isDrawn = ref(false);
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
// The script's own load slot calls back once the API is in, so the calculator waits for that here. A calculator that
// fails to build, or a script that never arrives, shows its failure in place of the drawing rather than breaking the page
const { isFailed, loaded: calculator } = useLazyLoad(async () => {
  const { GraphingCalculator } = await new Promise<typeof Desmos>((resolve) => {
    onLoaded(resolve);
  });
  const element = window.document.getElementById(id) as HTMLDivElement;
  const newCalculator = await GraphingCalculator(element, {
    border: false,
    expressionsCollapsed: true,
    invertedColors: isDark.value,
    keypad: false,
    showGrid: false,
    showXAxis: false,
    showYAxis: false,
    trace: false,
  });
  newCalculator.setExpressions(expressions.map((expression) => withDefaultExpressionColor(expression)));
  isDrawn.value = true;
  const newExpressionPanel = element.querySelector<HTMLDivElement>(".dcg-exppanel-outer");
  if (newExpressionPanel) {
    expressionPanel.value = newExpressionPanel;
    render(componentsToRender.value);
  }

  return newCalculator;
});

const animate = () => {
  if (!calculator.value) return;
  isAnimating.value = true;
  const savedSettings = { ...calculator.value.settings };
  calculator.value.setBlank();
  // Ignore updateSettings warnings about unsupported extraneous calculator settings.
  ignoreWarn(() => {
    calculator.value?.updateSettings(savedSettings);
  });

  const drawingTime = Temporal.Duration.from({ seconds: 5 }).total("milliseconds");
  let expressionIndex = 0;
  const { pause } = useIntervalFn(() => {
    const expression = takeOne(expressions, expressionIndex++);
    calculator.value?.setExpression(withDefaultExpressionColor(expression));
    if (expressionIndex === expressions.length) {
      pause();
      isAnimating.value = false;
    }
  }, drawingTime / expressions.length);
};

watch(isDark, (newIsDark) => {
  if (!calculator.value) return;
  calculator.value.updateSettings({ invertedColors: newIsDark });
});

watch(componentsToRender, (newComponentsToRender) => {
  render(newComponentsToRender);
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
