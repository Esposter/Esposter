import type { ModuleOptions } from "@nuxt/fonts";
// The UI library's pixel face is named through a custom property (`--ui-font-pixel`), which the module's CSS scan
// Does not read, so it would only be loaded on a page whose own stylesheet happens to spell it out. Declared global,
// Its font faces are in the stylesheet every page loads
export const fonts: Partial<ModuleOptions> = { families: [{ global: true, name: "VT323" }] };
