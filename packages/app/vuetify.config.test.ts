import { describe, expect, test } from "vitest";
import { defineVuetifyConfiguration } from "vuetify-nuxt-module/custom-configuration";

import vuetifyConfig from "./vuetify.config";

describe(defineVuetifyConfiguration, () => {
  test("theme, variations, and defaults", () => {
    expect.hasAssertions();

    expect(vuetifyConfig).toMatchInlineSnapshot(`
      {
        "defaults": {
          "VAutocomplete": {
            "variant": "outlined",
          },
          "VBtn": {
            "flat": true,
            "style": {
              "backgroundColor": "transparent",
            },
          },
          "VColorInput": {
            "variant": "outlined",
          },
          "VCombobox": {
            "variant": "outlined",
          },
          "VDataTable": {
            "VToolbar": {
              "style": {
                "borderRadius": ".25rem",
              },
            },
            "style": {
              "borderRadius": ".25rem",
            },
          },
          "VDialog": {
            "maxWidth": "100%",
            "width": 500,
          },
          "VFileInput": {
            "variant": "outlined",
          },
          "VSelect": {
            "variant": "outlined",
          },
          "VTextField": {
            "variant": "outlined",
          },
          "VTextarea": {
            "variant": "outlined",
          },
          "VToolbar": {
            "color": "surface",
          },
          "VToolbarTitle": {
            "style": {
              "marginInlineStart": 0,
            },
          },
          "VTooltip": {
            "location": "top",
          },
        },
        "display": {
          "mobileBreakpoint": "md",
          "thresholds": {
            "lg": 1280,
            "md": 960,
            "sm": 600,
            "xl": 1920,
            "xs": 0,
            "xxl": 2560,
          },
        },
        "labComponents": true,
        "theme": {
          "themes": {
            "dark": {
              "colors": {
                "background": "#18191a",
                "background-opacity-20": "#18191a33",
                "background-opacity-40": "#18191a66",
                "background-opacity-80": "#18191acc",
                "border": "#ccc",
                "error": "#ff5252",
                "info": "#2d88ff",
                "info-opacity-10": "#2d88ff1a",
                "on-info-opacity-10": "#fff",
                "primary": "#42b883",
                "surface": "#36393f",
                "surface-opacity-80": "#36393fcc",
                "text": "#fff",
              },
              "dark": true,
            },
            "light": {
              "colors": {
                "background": "#dae0e6",
                "background-opacity-20": "#dae0e633",
                "background-opacity-40": "#dae0e666",
                "background-opacity-80": "#dae0e6cc",
                "border": "#ccc",
                "error": "#ff5252",
                "info": "#2d88ff",
                "info-opacity-10": "#2d88ff1a",
                "on-info-opacity-10": "#000",
                "primary": "#42b883",
                "surface": "#fff",
                "surface-opacity-80": "#ffffffcc",
                "text": "#000",
              },
              "dark": false,
            },
          },
          "variations": {
            "colors": [
              "primary",
            ],
            "darken": 1,
            "lighten": 1,
          },
        },
      }
    `);
  });
});
