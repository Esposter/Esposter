import type { Component } from "vue";

import { TRES_CANVAS_NAME } from "#src/services/constants";
import { defineComponent, h } from "vue";

// The renderer needs WebGL, which the server does not have, so the server renders an empty placeholder in its place
const tresCanvasServer: Component = defineComponent({ name: TRES_CANVAS_NAME, setup: () => () => h("span") });

export default tresCanvasServer;
