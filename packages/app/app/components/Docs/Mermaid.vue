<script setup lang="ts">
import type { PanzoomObject } from "@panzoom/panzoom";

import { MAX_MERMAID_SCALE, MIN_MERMAID_SCALE } from "@/services/docs/constants";
import { getResultAsync } from "@esposter/shared";
import Panzoom from "@panzoom/panzoom";
import mermaid from "mermaid";
import { useTheme } from "vuetify";

interface MermaidProps {
  code: string;
}

const { code } = defineProps<MermaidProps>();
const theme = useTheme();
const wrapper = useTemplateRef("wrapper");
const container = useTemplateRef("container");
const id = useId();
const panzoom = shallowRef<PanzoomObject>();
const { isFullscreen, isSupported: isFullscreenSupported, toggle: toggleFullscreen } = useFullscreen(wrapper);
const zoomButtonProps = { density: "comfortable", size: "small", variant: "tonal" } as const;
// Entering/leaving full screen changes the viewport, so recenter instead of keeping a stale pan/zoom
watch(isFullscreen, () => {
  panzoom.value?.reset();
});

onMounted(async () => {
  mermaid.initialize({ startOnLoad: false, theme: theme.global.current.value.dark ? "dark" : "default" });
  const result = await getResultAsync(async () => {
    const { svg } = await mermaid.render(`mermaid-${id}`, code);
    return svg;
  });
  // On a render failure we keep showing the raw diagram source
  result.match((svg) => {
    if (!container.value) return;
    container.value.innerHTML = svg;
    const svgElement = container.value.querySelector("svg");
    if (!svgElement) return;
    panzoom.value = Panzoom(svgElement, { cursor: "grab", maxScale: MAX_MERMAID_SCALE, minScale: MIN_MERMAID_SCALE });
  }, console.error);
});
// Ctrl+wheel (and trackpad pinch, which browsers report as a ctrl wheel) zooms; plain wheel keeps scrolling the page
useEventListener(container, "wheel", (event) => {
  if (event.ctrlKey) panzoom.value?.zoomWithWheel(event);
});

onUnmounted(() => {
  panzoom.value?.destroy();
});
</script>

<template>
  <div ref="wrapper" relative class="group" :class="isFullscreen ? 'bg-surface' : undefined">
    <div
      ref="container"
      py-2
      flex
      justify-center
      :class="[panzoom ? 'overflow-hidden' : 'overflow-x-auto', isFullscreen ? 'h-full items-center' : undefined]"
    >
      <pre>{{ code }}</pre>
    </div>
    <div v-if="panzoom" op-0 flex gap-1 transition-opacity right-2 top-2 absolute group-hover:op-100>
      <StyledTooltipIconButton
        :button-props="zoomButtonProps"
        icon="mdi-plus"
        text="Zoom in"
        @click="panzoom.zoomIn()"
      />
      <StyledTooltipIconButton
        :button-props="zoomButtonProps"
        icon="mdi-minus"
        text="Zoom out"
        @click="panzoom.zoomOut()"
      />
      <StyledTooltipIconButton
        :button-props="zoomButtonProps"
        icon="mdi-backup-restore"
        text="Reset view"
        @click="panzoom.reset()"
      />
      <StyledTooltipIconButton
        v-if="isFullscreenSupported"
        :button-props="zoomButtonProps"
        :icon="isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
        :text="isFullscreen ? 'Exit full screen' : 'Full screen'"
        @click="toggleFullscreen()"
      />
    </div>
  </div>
</template>
