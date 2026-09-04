<script setup lang="ts">
import { MAX_MERMAID_SCALE, MIN_MERMAID_SCALE } from "@/services/docs/constants";
import { getResultAsync } from "@esposter/shared";
import { useTheme } from "vuetify";

interface MermaidZoomControl {
  icon: string;
  onClick: () => void;
  text: string;
}

interface Props {
  code: string;
}

const { code } = defineProps<Props>();
const theme = useTheme();
const wrapper = useTemplateRef("wrapper");
const container = useTemplateRef("container");
const id = useId();
const diagram = shallowRef<null | SVGSVGElement>(null);
const { panzoom } = usePanZoom(diagram, {
  cursor: "grab",
  maxScale: MAX_MERMAID_SCALE,
  minScale: MIN_MERMAID_SCALE,
});
const { isFullscreen, isSupported: isFullscreenSupported, toggle: toggleFullscreen } = useFullscreen(wrapper);
const zoomButtonProps = { density: "comfortable", size: "small", variant: "tonal" } as const;
const zoomControls = computed<MermaidZoomControl[]>(() => {
  const controls: MermaidZoomControl[] = [
    { icon: "mdi-plus", onClick: () => panzoom.value?.zoomIn(), text: "Zoom in" },
    { icon: "mdi-minus", onClick: () => panzoom.value?.zoomOut(), text: "Zoom out" },
    { icon: "mdi-backup-restore", onClick: () => panzoom.value?.reset(), text: "Reset view" },
  ];
  if (isFullscreenSupported.value)
    controls.push({
      icon: isFullscreen.value ? "mdi-fullscreen-exit" : "mdi-fullscreen",
      onClick: () => toggleFullscreen(),
      text: isFullscreen.value ? "Exit full screen" : "Full screen",
    });
  return controls;
});
// Entering/leaving full screen changes the viewport, so recenter instead of keeping a stale pan/zoom
watch(isFullscreen, () => {
  panzoom.value?.reset();
});

onMounted(async () => {
  const result = await getResultAsync(async () => {
    // Imported lazily after mount so the multi-megabyte mermaid chunk never resolves inside the docs
    // Page's Suspense: a failed chunk (stale PWA/browser cache after a redeploy) would otherwise reject
    // The pending tree and silently kill doc→doc navigation — the route reacts before the new tree
    // Swaps in (https://github.com/nuxt/nuxt/issues/14456), and Nuxt's chunk-error auto-reload only
    // Catches clean fetch failures, not stale-cache eval errors (https://github.com/nuxt/nuxt/issues/23612)
    const { default: mermaid } = await import("mermaid");
    mermaid.initialize({ startOnLoad: false, theme: theme.global.current.value.dark ? "dark" : "default" });
    const { svg } = await mermaid.render(`mermaid-${id}`, code);
    return svg;
  });
  // On a load or render failure we keep showing the raw diagram source
  result.match((svg) => {
    if (!container.value) return;
    container.value.innerHTML = svg;
    diagram.value = container.value.querySelector("svg");
  }, console.error);
});
// Ctrl+wheel (and trackpad pinch, which browsers report as a ctrl wheel) zooms; plain wheel keeps scrolling the page
useEventListener(container, "wheel", (event) => {
  if (event.ctrlKey) panzoom.value?.zoomWithWheel(event);
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
        v-for="{ icon, onClick, text } of zoomControls"
        :key="text"
        :button-props="zoomButtonProps"
        :icon
        :text
        @click="onClick()"
      />
    </div>
  </div>
</template>
