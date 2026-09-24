import type { ModuleOptions } from "@nuxt/fonts";
// Every style's faces are named through its style tokens (`UiStyleMap`), which the module's CSS scan does not read, so
// A face would only be loaded on a page whose own stylesheet happens to spell it out. Declared global, their font
// Faces are in the stylesheet every page loads: voxel's pixel face, and standard's sans and mono
export const fonts: Partial<ModuleOptions> = {
  families: [
    { global: true, name: "Inter", weights: [400, 600] },
    { global: true, name: "JetBrains Mono", weights: [400] },
    { global: true, name: "VT323" },
  ],
};
