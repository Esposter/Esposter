import { describe, expect, test } from "vitest";

import vuetifyConfig from "./vuetify.config";

describe("vuetifyConfig", () => {
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
                "background": "#16161e",
                "background-opacity-20": "#16161e33",
                "background-opacity-40": "#16161e66",
                "background-opacity-80": "#16161ecc",
                "border": "#5c5470",
                "error": "#e56b6f",
                "info": "#7fb7e6",
                "info-opacity-10": "#7fb7e61a",
                "on-info-opacity-10": "#f2e9e4",
                "on-primary-opacity-10": "#f2e9e4",
                "primary": "#e0a458",
                "primary-opacity-10": "#e0a4581a",
                "success": "#5ec8a0",
                "surface": "#221f33",
                "surface-opacity-80": "#221f33cc",
                "text": "#f2e9e4",
                "warning": "#f4d35e",
              },
              "dark": true,
            },
            "light": {
              "colors": {
                "background": "#efe6de",
                "background-opacity-20": "#efe6de33",
                "background-opacity-40": "#efe6de66",
                "background-opacity-80": "#efe6decc",
                "border": "#b3a6b1",
                "error": "#b0303a",
                "info": "#1d5a92",
                "info-opacity-10": "#1d5a921a",
                "on-info-opacity-10": "#221f33",
                "on-primary-opacity-10": "#221f33",
                "primary": "#8f4f0a",
                "primary-opacity-10": "#8f4f0a1a",
                "success": "#1c6b4c",
                "surface": "#faf5f0",
                "surface-opacity-80": "#faf5f0cc",
                "text": "#221f33",
                "warning": "#7a5a00",
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
