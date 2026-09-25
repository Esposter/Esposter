<script setup lang="ts">
import type { MermaidZoomControl } from "@/models/docs/MermaidZoomControl";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { MAX_MERMAID_SCALE, MIN_MERMAID_SCALE } from "@/services/docs/constants";
import { getResultAsync } from "@esposter/shared";

interface Props {
  code: string;
}

const { code } = defineProps<Props>();
const isDark = useIsDark();
const wrapper = useTemplateRef("wrapper");
const container = useTemplateRef("container");
const id = useId();
const diagram = shallowRef<SVGSVGElement>();
const { panzoom } = usePanZoom(diagram, {
  cursor: "grab",
  maxScale: MAX_MERMAID_SCALE,
  minScale: MIN_MERMAID_SCALE,
});
const { isFullscreen, isSupported: isFullscreenSupported, toggle: toggleFullscreen } = useFullscreen(wrapper);
const zoomControls = computed<MermaidZoomControl[]>(() => {
  const controls: MermaidZoomControl[] = [
    { label: "Zoom in", meaning: UiIconMeaning.ZoomIn, onClick: () => panzoom.value?.zoomIn() },
    { label: "Zoom out", meaning: UiIconMeaning.ZoomOut, onClick: () => panzoom.value?.zoomOut() },
    { label: "Reset view", meaning: UiIconMeaning.ResetView, onClick: () => panzoom.value?.reset() },
  ];
  if (isFullscreenSupported.value)
    controls.push({
      label: isFullscreen.value ? "Exit full screen" : "Full screen",
      meaning: isFullscreen.value ? UiIconMeaning.Collapse : UiIconMeaning.Expand,
      onClick: () => toggleFullscreen(),
    });
  return controls;
});
// Entering/leaving full screen changes the viewport, so recenter instead of keeping a stale pan/zoom
watch(isFullscreen, () => {
  panzoom.value?.reset();
});

onMounted(async () => {
  const svgResult = await getResultAsync(async () => {
    // Imported lazily after mount so the multi-megabyte mermaid chunk never resolves inside the docs
    // Page's Suspense: a failed chunk (stale PWA/browser cache after a redeploy) would otherwise reject
    // The pending tree and silently kill doc→doc navigation — the route reacts before the new tree
    // Swaps in (https://github.com/nuxt/nuxt/issues/14456), and Nuxt's chunk-error auto-reload only
    // Catches clean fetch failures, not stale-cache eval errors (https://github.com/nuxt/nuxt/issues/23612)
    const { default: mermaid } = await import("mermaid");
    mermaid.initialize({ startOnLoad: false, theme: isDark.value ? "dark" : "default" });
    const { svg } = await mermaid.render(`mermaid-${id}`, code);
    return svg;
  });
  // On a load or render failure we keep showing the raw diagram source
  svgResult.match((svg) => {
    if (!container.value) return;
    container.value.innerHTML = svg;
    diagram.value = container.value.querySelector("svg") ?? undefined;
  }, console.error);
});
// Ctrl+wheel (and trackpad pinch, which browsers report as a ctrl wheel) zooms; plain wheel keeps scrolling the page
useEventListener(container, "wheel", (event) => {
  if (event.ctrlKey) panzoom.value?.zoomWithWheel(event);
});
</script>

<template>
  <div ref="wrapper" relative class="group" :class="isFullscreen ? 'fullscreen' : undefined">
    <div
      ref="container"
      py-2
      flex
      justify-center
      :class="[panzoom ? 'of-hidden' : 'of-x-auto', isFullscreen ? 'h-full items-center' : undefined]"
    >
      <pre>{{ code }}</pre>
    </div>
    <div
      v-if="panzoom"
      op-0
      flex
      gap-1
      transition-opacity
      right-2
      top-2
      absolute
      focus-within:op-100
      group-hover:op-100
    >
      <UiIconButton
        v-for="{ label, meaning, onClick } of zoomControls"
        :key="label"
        :label
        :meaning
        @click="onClick()"
      />
    </div>
  </div>
</template>

<style scoped>
/* Opaque so the page behind cannot show through the diagram once it fills the screen */
.fullscreen {
  background-color: var(--ui-background);
}
</style>
