import type { Component } from "vue";

import { TresCanvas as CoreTresCanvas } from "@tresjs/core";
import { defineComponent, h } from "vue";

// Attributes and slots pass straight through to the renderer's canvas, which is the only element this component renders
const tresCanvasClient: Component = defineComponent({
  inheritAttrs: false,
  name: "TresCanvas",
  setup(_props, { attrs, slots }) {
    return () => h(CoreTresCanvas, attrs, slots);
  },
});

export default tresCanvasClient;
