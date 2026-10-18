<script setup lang="ts">
import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { DESKTOP_MIN_WIDTH, DEVICE_WIDTH_MAP } from "#shared/services/pageBuilder/constants";

interface Props {
  css: string;
  device: PageBuilderDevice;
  title: string;
}

defineSlots<{ default?: () => VNode }>();
const { css, device, title } = defineProps<Props>();

const frame = useTemplateRef("frame");
const pane = useTemplateRef("pane");
const { height: paneHeight, width: paneWidth } = useElementSize(pane);
const frameDocument = shallowRef<Document>();
const frameStyleSheet = shallowRef<CSSStyleSheet>();
const frameBody = computed(() => frameDocument.value?.body);
const frameWidth = computed(() =>
  device === PageBuilderDevice.Desktop ? Math.max(paneWidth.value, DESKTOP_MIN_WIDTH) : DEVICE_WIDTH_MAP[device],
);
const frameScale = computed(() => (paneWidth.value > 0 ? Math.min(1, paneWidth.value / frameWidth.value) : 1));

// The page's css is replaced at most once per animation frame, so a burst of style patches writes the sheet once
let styleFrame = 0;
watch([frameStyleSheet, () => css], ([styleSheet, cssText]) => {
  cancelAnimationFrame(styleFrame);
  styleFrame = requestAnimationFrame(() => styleSheet?.replaceSync(cssText));
});
onUnmounted(() => cancelAnimationFrame(styleFrame));

const onFrameLoad = () => {
  const contentWindow = frame.value?.contentWindow;
  const contentDocument = frame.value?.contentDocument;
  if (!contentWindow || !contentDocument) return;

  // A sheet adopted into a document must be constructed in that document's realm
  const styleSheet = new contentWindow.CSSStyleSheet();
  contentDocument.adoptedStyleSheets = [styleSheet];
  frameStyleSheet.value = styleSheet;
  frameDocument.value = contentDocument;
};
</script>

<!-- The page draws in its own document at its device's width, scaled down to fit a narrower pane rather than reflowed -->
<template>
  <div ref="pane" h-full w-full of-hidden>
    <iframe
      ref="frame"
      srcdoc="<!doctype html><html><head></head><body></body></html>"
      sandbox="allow-same-origin"
      :title
      :style="{
        border: 0,
        height: `${paneHeight / frameScale}px`,
        transform: `scale(${frameScale})`,
        transformOrigin: '0 0',
        width: `${frameWidth}px`,
      }"
      @load="onFrameLoad()"
    />
    <Teleport v-if="frameBody" :to="frameBody">
      <slot />
    </Teleport>
  </div>
</template>
