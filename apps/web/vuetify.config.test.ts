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
        "icons": {
          "defaultSet": "unocss-mdi",
          "unocssAdditionalIcons": {
            "alt": "i-mdi:apple-keyboard-option",
            "arrowdown": "i-mdi:arrow-down",
            "arrowleft": "i-mdi:arrow-left",
            "arrowright": "i-mdi:arrow-right",
            "arrowup": "i-mdi:arrow-up",
            "backspace": "i-mdi:backspace",
            "calendar": "i-mdi:calendar",
            "cancel": "i-mdi:close-circle",
            "checkboxIndeterminate": "i-mdi:minus-box",
            "checkboxOff": "i-mdi:checkbox-blank-outline",
            "checkboxOn": "i-mdi:checkbox-marked",
            "clear": "i-mdi:close-circle",
            "close": "i-mdi:close",
            "collapse": "i-mdi:chevron-up",
            "color": "i-mdi:palette",
            "command": "i-mdi:apple-keyboard-command",
            "complete": "i-mdi:check",
            "ctrl": "i-mdi:apple-keyboard-control",
            "delete": "i-mdi:close-circle",
            "delimiter": "i-mdi:circle",
            "dropdown": "i-mdi:menu-down",
            "edit": "i-mdi:pencil",
            "enter": "i-mdi:keyboard-return",
            "error": "i-mdi:close-circle",
            "expand": "i-mdi:chevron-down",
            "eyeDropper": "i-mdi:eyedropper",
            "file": "i-mdi:paperclip",
            "first": "i-mdi:page-first",
            "fullscreen": "i-mdi:fullscreen",
            "fullscreenExit": "i-mdi:fullscreen-exit",
            "info": "i-mdi:information",
            "last": "i-mdi:page-last",
            "loading": "i-mdi:cached",
            "menu": "i-mdi:menu",
            "minus": "i-mdi:minus",
            "next": "i-mdi:chevron-right",
            "pause": "i-mdi:pause",
            "play": "i-mdi:play",
            "plus": "i-mdi:plus",
            "prev": "i-mdi:chevron-left",
            "radioOff": "i-mdi:radiobox-blank",
            "radioOn": "i-mdi:radiobox-marked",
            "ratingEmpty": "i-mdi:star-outline",
            "ratingFull": "i-mdi:star",
            "ratingHalf": "i-mdi:star-half-full",
            "search": "i-mdi:magnify",
            "shift": "i-mdi:apple-keyboard-shift",
            "sortAsc": "i-mdi:arrow-up",
            "sortDesc": "i-mdi:arrow-down",
            "space": "i-mdi:keyboard-space",
            "subgroup": "i-mdi:menu-down",
            "success": "i-mdi:check-circle",
            "tableGroupCollapse": "i-mdi:chevron-down",
            "tableGroupExpand": "i-mdi:chevron-right",
            "treeviewCollapse": "i-mdi:menu-down",
            "treeviewExpand": "i-mdi:menu-right",
            "unfold": "i-mdi:unfold-more-horizontal",
            "upload": "i-mdi:cloud-upload",
            "volumeHigh": "i-mdi:volume-high",
            "volumeLow": "i-mdi:volume-low",
            "volumeMedium": "i-mdi:volume-medium",
            "volumeOff": "i-mdi:volume-variant-off",
            "warning": "i-mdi:alert-circle",
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
