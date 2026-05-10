import { defineConfig, presetAttributify, presetWind3 } from "unocss";
import { presetVuetify } from "unocss-preset-vuetify";

export default defineConfig({
  outputToCssLayers: {
    cssLayerName: (layer) => (layer === "properties" ? null : `uno.${layer}`),
  },
  presets: [presetWind3(), presetAttributify(), presetVuetify()],
  rules: [["overflow-anchor-none", { "overflow-anchor": "none" }]],
  safelist: [
    ...Array.from({ length: 6 }, (_, i) => `elevation-${i}`),
    ...["", "-0", "-sm", "-lg", "-xl", "-pill", "-circle", "-shaped"].map((suffix) => `rounded${suffix}`),
  ],
});
