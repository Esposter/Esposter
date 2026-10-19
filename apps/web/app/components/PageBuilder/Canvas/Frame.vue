<script setup lang="ts">
import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { DESKTOP_MIN_WIDTH, DEVICE_WIDTH_MAP } from "#shared/services/pageBuilder/constants";
import { CANVAS_FRAME_SRCDOC, useCanvasFrame } from "vue-canvas-frame-headless";

interface Props {
  css: string;
  device: PageBuilderDevice;
  title: string;
}

defineSlots<{ default?: () => VNode }>();
const { css, device, title } = defineProps<Props>();

const frame = useTemplateRef("frame");
const pane = useTemplateRef("pane");
const { frameBody, frameStyle } = useCanvasFrame({
  css: () => css,
  fill: () => device === PageBuilderDevice.Desktop,
  frame,
  pane,
  width: () => (device === PageBuilderDevice.Desktop ? DESKTOP_MIN_WIDTH : DEVICE_WIDTH_MAP[device]),
});
</script>

<!-- The page draws in its own document at its device's width, scaled down to fit a narrower pane rather than reflowed -->
<template>
  <div ref="pane" h-full w-full of-hidden>
    <iframe ref="frame" b-0 sandbox="allow-same-origin" :srcdoc="CANVAS_FRAME_SRCDOC" :style="frameStyle" :title />
    <Teleport v-if="frameBody" :to="frameBody">
      <slot />
    </Teleport>
  </div>
</template>
