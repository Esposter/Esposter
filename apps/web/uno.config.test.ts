import { globSync, readFileSync } from "node:fs";
import { createGenerator } from "unocss";
import { describe, expect, test } from "vitest";

import unoConfig from "./uno.config";

describe("unoConfig", () => {
  const { rules, safelist, shortcuts, theme } = unoConfig;

  test("rules, safelist, shortcuts, and theme", () => {
    expect.hasAssertions();

    expect({ rules, safelist, shortcuts, theme }).toMatchInlineSnapshot(`
      {
        "rules": [
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
            "of-anchor-none",
            {
              "overflow-anchor": "none",
            },
          ],
          [
            "bg-activated",
            {
              "background-color": "color-mix(in srgb, currentColor calc(var(--v-activated-opacity) * var(--v-theme-overlay-multiplier) * 100%), transparent)",
            },
          ],
          [
            "bg-hover",
            {
              "background-color": "color-mix(in srgb, currentColor calc(var(--v-hover-opacity) * var(--v-theme-overlay-multiplier) * 100%), transparent)",
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
          [
            "ui-frame",
            {
              "background-color": "var(--ui-panel)",
              "border-radius": "var(--ui-radius)",
              "box-shadow": "var(--ui-frame-shadow)",
            },
          ],
          [
            "ui-popover",
            {
              "background-color": "transparent",
              "border": "none",
              "color": "inherit",
              "filter": "var(--ui-lifted-filter)",
              "min-width": "anchor-size(width)",
              "overflow": "visible",
              "padding": "calc(var(--ui-step) * 2)",
            },
          ],
          [
            "ui-raised",
            {
              "background-color": "var(--ui-raised-background)",
              "border-radius": "var(--ui-radius)",
              "box-shadow": "var(--ui-raised-shadow)",
              "color": "var(--ui-text)",
              "font": "inherit",
            },
          ],
          [
            "ui-sunk",
            {
              "background-color": "var(--ui-background)",
              "border-radius": "var(--ui-radius)",
              "box-shadow": "var(--ui-sunk-shadow)",
              "color": "inherit",
              "font": "inherit",
              "padding": "0 calc(var(--ui-step) * 2)",
            },
          ],
          [
            "ui-body",
            {
              "color": "var(--ui-text)",
              "font-family": "var(--ui-font-body)",
              "font-size": "var(--ui-text-body)",
              "font-weight": "normal",
              "line-height": "1.2",
            },
          ],
          [
            "ui-display",
            {
              "color": "var(--ui-heading-color)",
              "font-family": "var(--ui-font-heading)",
              "font-size": "var(--ui-text-display)",
              "font-weight": "var(--ui-weight-heading)",
              "line-height": "1.2",
            },
          ],
          [
            "ui-heading",
            {
              "color": "var(--ui-heading-color)",
              "font-family": "var(--ui-font-heading)",
              "font-size": "var(--ui-text-heading)",
              "font-weight": "var(--ui-weight-heading)",
              "line-height": "1.2",
            },
          ],
          [
            "ui-title",
            {
              "color": "var(--ui-heading-color)",
              "font-family": "var(--ui-font-heading)",
              "font-size": "var(--ui-text-title)",
              "font-weight": "var(--ui-weight-heading)",
              "line-height": "1.2",
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
          "bg-background",
          "text-background",
          "bg-border",
          "text-border",
          "bg-error",
          "text-error",
          "bg-info",
          "text-info",
          "bg-primary",
          "text-primary",
          "bg-success",
          "text-success",
          "bg-surface",
          "text-surface",
          "bg-text",
          "text-text",
          "bg-warning",
          "text-warning",
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
          "bg-on-primary-opacity-10",
          "text-on-primary-opacity-10",
          "bg-primary-opacity-10",
          "text-primary-opacity-10",
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
          "i-mdi:chevron-up",
          "i-mdi:check",
          "i-mdi:close-circle",
          "i-mdi:close",
          "i-mdi:check-circle",
          "i-mdi:information",
          "i-mdi:alert-circle",
          "i-mdi:chevron-left",
          "i-mdi:chevron-right",
          "i-mdi:checkbox-marked",
          "i-mdi:checkbox-blank-outline",
          "i-mdi:minus-box",
          "i-mdi:circle",
          "i-mdi:arrow-up",
          "i-mdi:arrow-down",
          "i-mdi:chevron-down",
          "i-mdi:menu",
          "i-mdi:menu-down",
          "i-mdi:radiobox-marked",
          "i-mdi:radiobox-blank",
          "i-mdi:pencil",
          "i-mdi:star-outline",
          "i-mdi:star",
          "i-mdi:star-half-full",
          "i-mdi:cached",
          "i-mdi:page-first",
          "i-mdi:page-last",
          "i-mdi:unfold-more-horizontal",
          "i-mdi:paperclip",
          "i-mdi:plus",
          "i-mdi:minus",
          "i-mdi:calendar",
          "i-mdi:menu-right",
          "i-mdi:eyedropper",
          "i-mdi:cloud-upload",
          "i-mdi:palette",
          "i-mdi:apple-keyboard-command",
          "i-mdi:apple-keyboard-control",
          "i-mdi:keyboard-space",
          "i-mdi:apple-keyboard-shift",
          "i-mdi:apple-keyboard-option",
          "i-mdi:keyboard-return",
          "i-mdi:arrow-left",
          "i-mdi:arrow-right",
          "i-mdi:backspace",
          "i-mdi:play",
          "i-mdi:pause",
          "i-mdi:fullscreen",
          "i-mdi:fullscreen-exit",
          "i-mdi:volume-high",
          "i-mdi:volume-medium",
          "i-mdi:volume-low",
          "i-mdi:volume-variant-off",
          "i-mdi:magnify",
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
          "text-hint": "op-medium-emphasis text-body-small",
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
          "ui-bar": "shadow-[inset_0_calc(var(--ui-border-width)*-1)_0_0_var(--ui-border)]",
          "ui-block": "bg-panel grow-0 shrink basis-[calc(var(--ui-step)*4)] min-w-[var(--ui-step)] h-[calc(var(--ui-step)*6)] shadow-[var(--ui-block-shadow)] data-[filled]:bg-accent",
          "ui-blocks": "flex gap-1 max-w-full data-[ui-style=standard]:gap-0 data-[ui-style=standard]:rd-full data-[ui-style=standard]:of-hidden data-[ui-style=standard]:shadow-[var(--ui-sunk-shadow)]",
          "ui-button": "px-2 min-h-8 min-w-8 inline-flex gap-2 items-center justify-center shrink-0 cursor-pointer ui-raised hover:[filter:var(--ui-hover-filter)] hover:[background-image:var(--ui-hover-overlay)] active:[background-image:var(--ui-pressed-overlay)] disabled:cursor-default disabled:op-disabled aria-pressed:bg-accent aria-pressed:text-background aria-checked:bg-accent aria-checked:text-background data-[variant=Accent]:bg-accent data-[variant=Accent]:text-background data-[variant=Danger]:bg-error data-[variant=Danger]:text-background data-[variant=Quiet]:bg-transparent data-[variant=Quiet]:shadow-none data-[variant=Quiet]:text-muted data-[variant=Quiet]:hover:bg-[color-mix(in_srgb,var(--ui-tint)_10%,transparent)] data-[variant=Quiet]:hover:text-text data-[variant=Quiet]:aria-pressed:bg-accent data-[variant=Quiet]:aria-pressed:text-background",
          "ui-item": "px-2 text-left w-full cursor-pointer rd-[var(--ui-radius)] hover:bg-[color-mix(in_srgb,var(--ui-tint)_10%,transparent)] aria-selected:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)] data-[highlighted]:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)]",
          "ui-tab": "px-3 py-1 text-muted text-nowrap cursor-pointer no-underline hover:bg-[color-mix(in_srgb,var(--ui-tint)_10%,transparent)] aria-[current=page]:text-accent aria-[current=page]:shadow-[inset_0_calc(var(--ui-border-width)*-1)_0_0_var(--ui-accent)] data-[selected]:text-accent data-[selected]:shadow-[inset_0_calc(var(--ui-border-width)*-1)_0_0_var(--ui-accent)]",
          "ui-tab-list": "flex of-x-auto ui-bar",
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
            "accent": "var(--ui-accent)",
            "background": "var(--ui-background)",
            "background-opacity-20": "rgb(var(--v-theme-background-opacity-20))",
            "background-opacity-40": "rgb(var(--v-theme-background-opacity-40))",
            "background-opacity-80": "rgb(var(--v-theme-background-opacity-80))",
            "border": "var(--ui-border)",
            "error": "var(--ui-error)",
            "heading-color": "var(--ui-heading-color)",
            "info": "var(--ui-info)",
            "info-opacity-10": "rgb(var(--v-theme-info-opacity-10))",
            "muted": "var(--ui-muted)",
            "on-info-opacity-10": "rgb(var(--v-theme-on-info-opacity-10))",
            "on-primary-opacity-10": "rgb(var(--v-theme-on-primary-opacity-10))",
            "panel": "var(--ui-panel)",
            "primary": "rgb(var(--v-theme-primary))",
            "primary-darken-1": "rgb(var(--v-theme-primary-darken-1))",
            "primary-lighten-1": "rgb(var(--v-theme-primary-lighten-1))",
            "primary-opacity-10": "rgb(var(--v-theme-primary-opacity-10))",
            "success": "var(--ui-success)",
            "surface": "rgb(var(--v-theme-surface))",
            "surface-opacity-80": "rgb(var(--v-theme-surface-opacity-80))",
            "text": "var(--ui-text)",
            "warning": "var(--ui-warning)",
          },
          "font": {
            "sans": "Roboto, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"",
          },
        },
      }
    `);
  });

  test("each design style's tokens", async () => {
    expect.hasAssertions();

    const uno = await createGenerator(unoConfig);
    const { getLayer } = await uno.generate("", { preflights: true, safelist: false });

    expect(getLayer("theme")).toMatchInlineSnapshot(`
      "/* layer: theme, alias: uno-theme */
      @layer uno-theme{
      [data-ui-style="standard"]{--ui-block-shadow:none;--ui-border-width:0.0625rem;--ui-focus-width:calc(var(--ui-step) / 2);--ui-font-body:Inter, ui-sans-serif, system-ui, sans-serif;--ui-font-heading:Inter, ui-sans-serif, system-ui, sans-serif;--ui-font-mono:"JetBrains Mono", ui-monospace, monospace;--ui-frame-shadow:inset 0 0 0 var(--ui-border-width) var(--ui-border);--ui-heading-color:var(--ui-text);--ui-hover-filter:none;--ui-hover-overlay:linear-gradient(color-mix(in srgb, var(--ui-text) 6%, transparent) 0 0);--ui-lifted-filter:drop-shadow(0 calc(var(--ui-step) * 2) calc(var(--ui-step) * 4) rgb(0 0 0 / 0.25));--ui-pressed-overlay:linear-gradient(color-mix(in srgb, var(--ui-text) 12%, transparent) 0 0);--ui-radius:var(--ui-step);--ui-raised-background:color-mix(in srgb, var(--ui-text) 6%, var(--ui-panel));--ui-raised-shadow:inset 0 0 0 var(--ui-border-width) var(--ui-border);--ui-scrim:var(--ui-background);--ui-sunk-shadow:inset 0 0 0 var(--ui-border-width) var(--ui-border);--ui-text-body:0.875rem;--ui-text-display:2.25rem;--ui-text-heading:1rem;--ui-text-title:1.375rem;--ui-tint:var(--ui-text);--ui-weight-heading:600;}
      [data-ui-style="voxel"]{--ui-block-shadow:var(--ui-sunk-shadow);--ui-border-width:var(--ui-step);--ui-focus-width:var(--ui-step);--ui-font-body:VT323, monospace;--ui-font-heading:VT323, monospace;--ui-font-mono:VT323, monospace;--ui-frame-shadow:0 calc(var(--ui-step) * -1) 0 0 var(--ui-border), 0 var(--ui-step) 0 0 var(--ui-border), calc(var(--ui-step) * -1) 0 0 0 var(--ui-border), var(--ui-step) 0 0 0 var(--ui-border), inset 0 var(--ui-step) 0 0 color-mix(in srgb, var(--ui-text) 8%, transparent);--ui-heading-color:var(--ui-accent);--ui-hover-filter:brightness(1.25);--ui-hover-overlay:none;--ui-lifted-filter:none;--ui-pressed-overlay:none;--ui-radius:0;--ui-raised-background:var(--ui-border);--ui-raised-shadow:inset calc(var(--ui-step) / -2) calc(var(--ui-step) / -2) 0 0 color-mix(in srgb, var(--ui-background) 45%, transparent), inset calc(var(--ui-step) / 2) calc(var(--ui-step) / 2) 0 0 color-mix(in srgb, var(--ui-text) 20%, transparent);--ui-scrim:repeating-conic-gradient(var(--ui-background) 0 25%, transparent 0 50%) 0 0 / calc(var(--ui-step) * 2) calc(var(--ui-step) * 2);--ui-sunk-shadow:inset 0 calc(var(--ui-step) / -2) 0 0 var(--ui-border);--ui-text-body:calc(var(--ui-step) * 5);--ui-text-display:calc(var(--ui-step) * 12);--ui-text-heading:calc(var(--ui-step) * 6);--ui-text-title:calc(var(--ui-step) * 8);--ui-tint:var(--ui-accent);--ui-weight-heading:normal;}
      }"
    `);
  });

  // The pipeline scans components but not plain TypeScript, so a .ts file naming an icon opts in with the magic
  // Comment, and an icon the extractor cannot read out of its file — a v-icon's text content — draws nothing
  test("every icon named in source generates its rule", async () => {
    expect.hasAssertions();

    const uno = await createGenerator(unoConfig);
    const missingIcons: string[] = [];

    for (const path of globSync("{app,shared}/**/*.{ts,vue}", { cwd: import.meta.dirname })) {
      if (path.endsWith(".test.ts")) continue;
      const code = readFileSync(`${import.meta.dirname}/${path}`, "utf8");
      // Only a class that starts at `i-`: `.ui-dialog:focus-visible` is a selector, not the `dialog` collection
      const icons = code.match(/(?<![\w-])i-[\da-z]+:[\da-z-]+/gu);
      if (!icons) continue;
      if (path.endsWith(".ts") && !code.includes("@unocss-include")) {
        missingIcons.push(path);
        continue;
      }

      const { matched } = await uno.generate(code, { id: path, preflights: false, safelist: false });
      for (const icon of icons) if (!matched.has(icon)) missingIcons.push(`${path}: ${icon}`);
    }

    expect(missingIcons).toStrictEqual([]);
  });
});
