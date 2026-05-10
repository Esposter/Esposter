import { defineConfig, presetAttributify, presetWind3 } from "unocss";
import { presetVuetify } from "unocss-preset-vuetify";

export default defineConfig({
  outputToCssLayers: {
    cssLayerName: (layer) => (layer === "properties" ? null : `uno.${layer}`),
  },
  presets: [presetWind3(), presetAttributify(), presetVuetify()],
  rules: [["overflow-anchor-none", { "overflow-anchor": "none" }]],
  safelist: [...Array.from({ length: 6 }, (_, i) => `elevation-${i}`)],
  theme: {
    colors: {
      backgroundOpacity20: "rgb(var(--v-theme-backgroundOpacity20))",
      backgroundOpacity40: "rgb(var(--v-theme-backgroundOpacity40))",
      backgroundOpacity80: "rgb(var(--v-theme-backgroundOpacity80))",
      border: "rgb(var(--v-theme-border))",
      infoOpacity10: "rgb(var(--v-theme-infoOpacity10))",
      "primary-darken-1": "rgb(var(--v-theme-primary-darken-1))",
      "primary-lighten-1": "rgb(var(--v-theme-primary-lighten-1))",
      surfaceOpacity80: "rgb(var(--v-theme-surfaceOpacity80))",
    },
  },
});
