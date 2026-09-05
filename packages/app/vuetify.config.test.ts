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
            "hideDetails": "auto",
            "variant": "outlined",
          },
          "VBtn": {
            "flat": true,
          },
          "VCheckbox": {
            "hideDetails": "auto",
          },
          "VColorInput": {
            "hideDetails": "auto",
            "variant": "outlined",
          },
          "VCombobox": {
            "hideDetails": "auto",
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
            "hideDetails": "auto",
            "variant": "outlined",
          },
          "VRadioGroup": {
            "hideDetails": "auto",
          },
          "VSelect": {
            "hideDetails": "auto",
            "variant": "outlined",
          },
          "VSlider": {
            "hideDetails": "auto",
          },
          "VSnackbar": {
            "location": "top right",
          },
          "VSwitch": {
            "color": "primary",
            "hideDetails": "auto",
          },
          "VTextField": {
            "hideDetails": "auto",
            "variant": "outlined",
          },
          "VTextarea": {
            "hideDetails": "auto",
            "variant": "outlined",
          },
          "VToolbar": {
            "color": "surface",
          },
          "VToolbarTitle": {
            "style": {
              "marginInlineStart": 0,
              "paddingLeft": "1rem",
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
          "defaultTheme": "light",
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
                "on-primary-opacity-10": "#fff",
                "primary": "#42b883",
                "primary-opacity-10": "#42b8831a",
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
                "on-primary-opacity-10": "#000",
                "primary": "#42b883",
                "primary-opacity-10": "#42b8831a",
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
