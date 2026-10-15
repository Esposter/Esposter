import { type Component, defineComponent, h } from "vue";

// The renderer needs WebGL, which the server does not have, so the server renders an empty placeholder in its place
const tresCanvasServer: Component = defineComponent({ name: "TresCanvas", setup: () => () => h("span") });

export default tresCanvasServer;
