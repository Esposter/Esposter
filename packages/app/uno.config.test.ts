import { defineConfig } from "unocss";
import { describe, expect, test } from "vitest";

import unoConfig from "./uno.config";

describe(defineConfig, () => {
  const { rules, safelist, shortcuts, theme } = unoConfig;

  test("rules, safelist, shortcuts, and theme", () => {
    expect.hasAssertions();

    expect({ rules, safelist, shortcuts, theme }).toMatchInlineSnapshot(`
      {
        "rules": [
          [
            "elevation--1",
            {
              "box-shadow": "inset 0 2px 1px -1px rgba(0,0,0,0.2), inset 0 1px 1px 0 rgba(0,0,0,0.14), inset 0 1px 3px 0 rgba(0,0,0,0.12)",
            },
          ],
          [
            "elevation-0",
            {
              "--v-elevation-overlay": "color-mix(in srgb, var(--v-elevation-overlay-color, #000) 0%, transparent)",
              "box-shadow": "0px 0px 0px 0px rgba(var(--v-shadow-color), var(--v-shadow-key-opacity,     0.3 )), 0px 0px  0px 0px rgba(var(--v-shadow-color), var(--v-shadow-ambient-opacity, 0.15))",
            },
          ],
          [
            "elevation-1",
            {
              "--v-elevation-overlay": "color-mix(in srgb, var(--v-elevation-overlay-color, #000) 2%, transparent)",
              "box-shadow": "0px 1px 2px 0px rgba(var(--v-shadow-color), var(--v-shadow-key-opacity,     0.3 )), 0px 1px  3px 1px rgba(var(--v-shadow-color), var(--v-shadow-ambient-opacity, 0.15))",
            },
          ],
          [
            "elevation-2",
            {
              "--v-elevation-overlay": "color-mix(in srgb, var(--v-elevation-overlay-color, #000) 4%, transparent)",
              "box-shadow": "0px 1px 2px 0px rgba(var(--v-shadow-color), var(--v-shadow-key-opacity,     0.3 )), 0px 2px  6px 2px rgba(var(--v-shadow-color), var(--v-shadow-ambient-opacity, 0.15))",
            },
          ],
          [
            "elevation-3",
            {
              "--v-elevation-overlay": "color-mix(in srgb, var(--v-elevation-overlay-color, #000) 6%, transparent)",
              "box-shadow": "0px 1px 3px 0px rgba(var(--v-shadow-color), var(--v-shadow-key-opacity,     0.3 )), 0px 4px  8px 3px rgba(var(--v-shadow-color), var(--v-shadow-ambient-opacity, 0.15))",
            },
          ],
          [
            "elevation-4",
            {
              "--v-elevation-overlay": "color-mix(in srgb, var(--v-elevation-overlay-color, #000) 8%, transparent)",
              "box-shadow": "0px 2px 3px 0px rgba(var(--v-shadow-color), var(--v-shadow-key-opacity,     0.3 )), 0px 6px 10px 4px rgba(var(--v-shadow-color), var(--v-shadow-ambient-opacity, 0.15))",
            },
          ],
          [
            "elevation-5",
            {
              "--v-elevation-overlay": "color-mix(in srgb, var(--v-elevation-overlay-color, #000) 10%, transparent)",
              "box-shadow": "0px 4px 4px 0px rgba(var(--v-shadow-color), var(--v-shadow-key-opacity,     0.3 )), 0px 8px 12px 6px rgba(var(--v-shadow-color), var(--v-shadow-ambient-opacity, 0.15))",
            },
          ],
          [
            "overflow-anchor-none",
            {
              "overflow-anchor": "none",
            },
          ],
          [
            "op-disabled",
            {
              "opacity": "var(--v-disabled-opacity, 0.38)",
            },
          ],
          [
            "op-high-emphasis",
            {
              "opacity": "var(--v-high-emphasis-opacity, 0.87)",
            },
          ],
          [
            "op-loading",
            {
              "opacity": "var(--v-loading-opacity, 0.5)",
            },
          ],
          [
            "op-medium-emphasis",
            {
              "opacity": "var(--v-medium-emphasis-opacity, 0.6)",
            },
          ],
        ],
        "safelist": [
          "elevation-0",
          "elevation-1",
          "elevation-2",
          "elevation-3",
          "elevation-4",
          "elevation-5",
          "bg-border",
          "text-border",
          "bg-error",
          "text-error",
          "bg-info",
          "text-info",
          "bg-primary",
          "text-primary",
          "bg-background",
          "text-background",
          "bg-surface",
          "text-surface",
          "bg-text",
          "text-text",
          "bg-background-opacity-20",
          "text-background-opacity-20",
          "bg-background-opacity-40",
          "text-background-opacity-40",
          "bg-background-opacity-80",
          "text-background-opacity-80",
          "bg-info-opacity-10",
          "text-info-opacity-10",
          "bg-on-info-opacity-10",
          "text-on-info-opacity-10",
          "bg-surface-opacity-80",
          "text-surface-opacity-80",
          "bg-primary-darken-1",
          "text-primary-darken-1",
          "bg-primary-lighten-1",
          "text-primary-lighten-1",
          "op-disabled",
          "op-high-emphasis",
          "op-loading",
          "op-medium-emphasis",
        ],
        "shortcuts": {
          "text-body-large": [
            {
              "font-family": "var(--v-font-body)",
              "font-size": "1rem",
              "font-weight": 400,
              "letter-spacing": "0.03125em",
              "line-height": 1.5,
            },
          ],
          "text-body-medium": [
            {
              "font-family": "var(--v-font-body)",
              "font-size": "0.875rem",
              "font-weight": 400,
              "letter-spacing": "0.0178571429em",
              "line-height": 1.4285714286,
            },
          ],
          "text-body-small": [
            {
              "font-family": "var(--v-font-body)",
              "font-size": "0.75rem",
              "font-weight": 400,
              "letter-spacing": "0.0333333333em",
              "line-height": 1.3333333333,
            },
          ],
          "text-display-large": [
            {
              "font-family": "var(--v-font-heading)",
              "font-size": "3.5625rem",
              "font-weight": 400,
              "letter-spacing": "-0.0043859649em",
              "line-height": 1.1228070175,
            },
          ],
          "text-display-medium": [
            {
              "font-family": "var(--v-font-heading)",
              "font-size": "2.8125rem",
              "font-weight": 400,
              "letter-spacing": "normal",
              "line-height": 1.1555555556,
            },
          ],
          "text-display-small": [
            {
              "font-family": "var(--v-font-heading)",
              "font-size": "2.25rem",
              "font-weight": 400,
              "letter-spacing": "normal",
              "line-height": 1.2222222222,
            },
          ],
          "text-headline-large": [
            {
              "font-family": "var(--v-font-heading)",
              "font-size": "2rem",
              "font-weight": 400,
              "letter-spacing": "normal",
              "line-height": 1.25,
            },
          ],
          "text-headline-medium": [
            {
              "font-family": "var(--v-font-heading)",
              "font-size": "1.75rem",
              "font-weight": 400,
              "letter-spacing": "normal",
              "line-height": 1.2857142857,
            },
          ],
          "text-headline-small": [
            {
              "font-family": "var(--v-font-heading)",
              "font-size": "1.5rem",
              "font-weight": 400,
              "letter-spacing": "normal",
              "line-height": 1.3333333333,
            },
          ],
          "text-label-large": [
            {
              "font-family": "var(--v-font-body)",
              "font-size": "0.875rem",
              "font-weight": 500,
              "letter-spacing": "0.0071428571em",
              "line-height": 1.4285714286,
            },
          ],
          "text-label-medium": [
            {
              "font-family": "var(--v-font-body)",
              "font-size": "0.75rem",
              "font-weight": 500,
              "letter-spacing": "0.0416666667em",
              "line-height": 1.3333333333,
            },
          ],
          "text-label-small": [
            {
              "font-family": "var(--v-font-body)",
              "font-size": "0.6875rem",
              "font-weight": 500,
              "letter-spacing": "0.0454545455em",
              "line-height": 1.4545454545,
            },
          ],
          "text-title-large": [
            {
              "font-family": "var(--v-font-heading)",
              "font-size": "1.375rem",
              "font-weight": 400,
              "letter-spacing": "normal",
              "line-height": 1.2727272727,
            },
          ],
          "text-title-medium": [
            {
              "font-family": "var(--v-font-body)",
              "font-size": "1rem",
              "font-weight": 500,
              "letter-spacing": "0.009375em",
              "line-height": 1.5,
            },
          ],
          "text-title-small": [
            {
              "font-family": "var(--v-font-body)",
              "font-size": "0.875rem",
              "font-weight": 500,
              "letter-spacing": "0.0071428571em",
              "line-height": 1.4285714286,
            },
          ],
        },
        "theme": {
          "breakpoint": {
            "lg": "1280px",
            "md": "960px",
            "sm": "600px",
            "xl": "1920px",
            "xs": "0px",
            "xxl": "2560px",
          },
          "colors": {
            "background": "rgb(var(--v-theme-background))",
            "background-opacity-20": "rgb(var(--v-theme-background-opacity-20))",
            "background-opacity-40": "rgb(var(--v-theme-background-opacity-40))",
            "background-opacity-80": "rgb(var(--v-theme-background-opacity-80))",
            "border": "rgb(var(--v-theme-border))",
            "error": "rgb(var(--v-theme-error))",
            "info": "rgb(var(--v-theme-info))",
            "info-opacity-10": "rgb(var(--v-theme-info-opacity-10))",
            "on-info-opacity-10": "rgb(var(--v-theme-on-info-opacity-10))",
            "primary": "rgb(var(--v-theme-primary))",
            "primary-darken-1": "rgb(var(--v-theme-primary-darken-1))",
            "primary-lighten-1": "rgb(var(--v-theme-primary-lighten-1))",
            "surface": "rgb(var(--v-theme-surface))",
            "surface-opacity-80": "rgb(var(--v-theme-surface-opacity-80))",
            "text": "rgb(var(--v-theme-text))",
          },
          "font": {
            "sans": "Roboto, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"",
          },
        },
      }
    `);
  });
});
