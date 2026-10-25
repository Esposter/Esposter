import type { Component } from "vue";

import { TRES_CANVAS_NAME } from "#src/services/constants";
import { TresCanvas as CoreTresCanvas } from "@tresjs/core";
import { defineComponent, h } from "vue";

// Attributes and slots pass straight through to the renderer's canvas, which is the only element this component renders
const tresCanvasClient: Component = defineComponent({
  inheritAttrs: false,
  name: TRES_CANVAS_NAME,
  setup(_props, { attrs, slots }) {
    return () => h(CoreTresCanvas, attrs, slots);
  },
});

export default tresCanvasClient;
