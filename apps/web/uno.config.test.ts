import { globSync, readFileSync } from "node:fs";
import { createGenerator } from "unocss";
import { assert, describe, expect, test } from "vitest";

import unoConfig from "./uno.config";

describe("unoConfig", () => {
  const { rules, safelist, shortcuts, theme } = unoConfig;

  test("rules, safelist, shortcuts, and theme", () => {
    expect.hasAssertions();

    expect({ rules, safelist, shortcuts, theme }).toMatchInlineSnapshot(`
      {
        "rules": [
          [
            "of-anchor-none",
            {
              "overflow-anchor": "none",
            },
          ],
          [
            "op-disabled",
            {
              "opacity": "0.38",
            },
          ],
          [
            "op-loading",
            {
              "opacity": "0.5",
            },
          ],
          [
            "ui-field",
            [
              {
                "background-color": "var(--ui-panel)",
                "border-radius": "var(--ui-control-radius)",
                "color": "inherit",
                "font": "inherit",
              },
              {
                "$$symbol-selector": [Function],
                "background-color": "color-mix(in srgb, var(--ui-tint) 10%, var(--ui-panel))",
                "outline-color": "transparent",
              },
              {
                "$$symbol-parent": "@media (forced-colors: active)",
                "border": "var(--ui-border-width) solid transparent",
              },
            ],
          ],
          [
            "ui-frame",
            [
              {
                "background-color": "var(--ui-panel)",
                "border-radius": "var(--ui-container-radius)",
                "box-shadow": "var(--ui-frame-shadow)",
              },
              {
                "$$symbol-parent": "@media (forced-colors: active)",
                "border": "var(--ui-border-width) solid transparent",
              },
            ],
          ],
          [
            "ui-lifted",
            [
              {
                "background-color": "var(--ui-lifted)",
                "border-radius": "var(--ui-container-radius)",
                "box-shadow": "var(--ui-lifted-shadow)",
              },
              {
                "$$symbol-parent": "@media (forced-colors: active)",
                "border": "var(--ui-border-width) solid transparent",
              },
            ],
          ],
          [
            "ui-popover",
            {
              "background-color": "transparent",
              "border": "none",
              "color": "inherit",
              "min-width": "anchor-size(width)",
              "overflow": "visible",
              "padding": "calc(var(--ui-step) * 2)",
            },
          ],
          [
            "ui-raised",
            [
              {
                "background-color": "var(--ui-raised-background)",
                "border-radius": "var(--ui-control-radius)",
                "box-shadow": "var(--ui-raised-shadow)",
                "color": "var(--ui-raised-color)",
                "font": "inherit",
              },
              {
                "$$symbol-parent": "@media (forced-colors: active)",
                "border": "var(--ui-border-width) solid transparent",
              },
            ],
          ],
          [
            "ui-pill",
            {
              "border-radius": "var(--ui-pill-radius)",
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
        "safelist": undefined,
        "shortcuts": {
          "ui-bar": "shadow-[inset_0_calc(var(--ui-border-width)*-1)_0_0_var(--ui-divider)]",
          "ui-block": "bg-border grow-0 shrink basis-[calc(var(--ui-step)*4)] min-w-[var(--ui-step)] h-[var(--ui-step)] op-[var(--ui-block-opacity)] data-[filled]:bg-[var(--ui-blocks-fill)]",
          "ui-blocks": "flex gap-1 max-w-full [--ui-blocks-fill:var(--ui-accent)] data-[ui-style=standard]:rd-full data-[ui-style=standard]:bg-border data-[ui-style=standard]:bg-[linear-gradient(var(--ui-blocks-fill)_0_0)] data-[ui-style=standard]:bg-no-repeat data-[ui-style=standard]:bg-[length:var(--ui-blocks-value)_100%] data-[ui-style=standard]:[transition:background-size_var(--ui-motion-medium)]",
          "ui-button": "px-3 py-1 min-h-8 min-w-8 inline-flex gap-2 items-center justify-center shrink-0 cursor-pointer ui-raised [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11 hover:[filter:var(--ui-hover-filter)] hover:[background-image:var(--ui-hover-overlay)] active:[background-image:var(--ui-pressed-overlay)] disabled:cursor-default disabled:op-disabled aria-pressed:bg-accent aria-pressed:text-background aria-checked:bg-accent aria-checked:text-background data-[variant=Accent]:bg-accent data-[variant=Accent]:text-background data-[variant=Danger]:bg-error data-[variant=Danger]:text-background data-[variant=Field]:bg-[var(--ui-panel)] data-[variant=Field]:shadow-none data-[variant=Field]:text-text data-[variant=Field]:focus-visible:outline-hidden data-[variant=Field]:focus-visible:bg-[color-mix(in_srgb,var(--ui-tint)_10%,var(--ui-panel))] data-[variant=Field]:aria-pressed:bg-[color-mix(in_srgb,var(--ui-info)_10%,var(--ui-panel))] data-[variant=Field]:aria-pressed:text-text data-[variant=Search]:bg-[var(--ui-panel)] data-[variant=Search]:shadow-none data-[variant=Search]:text-text data-[variant=Search]:rd-[var(--ui-pill-radius)] data-[variant=Search]:focus-visible:outline-hidden data-[variant=Search]:focus-visible:bg-[color-mix(in_srgb,var(--ui-tint)_10%,var(--ui-panel))] data-[variant=Quiet]:bg-transparent data-[variant=Quiet]:shadow-none data-[variant=Quiet]:text-muted data-[variant=Quiet]:hover:bg-[color-mix(in_srgb,var(--ui-tint)_10%,transparent)] data-[variant=Quiet]:hover:text-text data-[variant=Quiet]:aria-pressed:bg-accent data-[variant=Quiet]:aria-pressed:text-background data-[variant=Quiet]:aria-checked:bg-accent data-[variant=Quiet]:aria-checked:text-background",
          "ui-card": "p-3 text-left cursor-pointer ui-frame hover:[filter:var(--ui-hover-filter)] hover:[background-image:var(--ui-hover-overlay)]",
          "ui-guide": "shadow-[inset_var(--ui-border-width)_0_0_0_var(--ui-divider)]",
          "ui-item": "ui-row [@media(pointer:coarse)]:min-h-11 cursor-pointer focus-visible:outline-hidden hover:bg-[color-mix(in_srgb,var(--ui-tint)_10%,transparent)] aria-selected:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)] aria-[current=page]:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)] aria-[current=true]:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)] data-[highlighted]:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--ui-tint)_20%,transparent)]",
          "ui-row": "px-2 py-1 text-left flex gap-2 w-full min-h-8 items-center rd-[var(--ui-control-radius)]",
          "ui-tab": "px-3 py-1 [@media(pointer:coarse)]:min-h-11 flex items-center text-muted text-nowrap cursor-pointer no-underline hover:bg-[color-mix(in_srgb,var(--ui-tint)_10%,transparent)] aria-[current=page]:text-accent aria-[current=page]:shadow-[inset_0_calc(var(--ui-indicator-width)*-1)_0_0_var(--ui-accent)] data-[selected]:text-accent data-[selected]:shadow-[inset_0_calc(var(--ui-indicator-width)*-1)_0_0_var(--ui-accent)]",
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
            "border": "var(--ui-border)",
            "divider": "var(--ui-divider)",
            "error": "var(--ui-error)",
            "heading-color": "var(--ui-heading-color)",
            "info": "var(--ui-info)",
            "lifted": "var(--ui-lifted)",
            "muted": "var(--ui-muted)",
            "panel": "var(--ui-panel)",
            "success": "var(--ui-success)",
            "text": "var(--ui-text)",
            "warning": "var(--ui-warning)",
          },
          "font": {
            "sans": "Inter, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"",
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
      :root, :host { --font-sans: Inter, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; --font-mono: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; --default-font-family: var(--font-sans); --default-monoFont-family: var(--font-mono); }
      [data-ui-style="standard"]{--ui-block-opacity:0;--ui-border-width:0.0625rem;--ui-container-radius:calc(var(--ui-step) * 2);--ui-control-radius:var(--ui-step);--ui-focus-width:calc(var(--ui-step) / 2);--ui-font-body:Inter, ui-sans-serif, system-ui, sans-serif;--ui-font-heading:Inter, ui-sans-serif, system-ui, sans-serif;--ui-font-mono:"JetBrains Mono", ui-monospace, monospace;--ui-frame-shadow:none;--ui-heading-color:var(--ui-text);--ui-hover-filter:none;--ui-hover-overlay:linear-gradient(color-mix(in srgb, currentColor 8%, transparent) 0 0);--ui-indicator-width:calc(var(--ui-border-width) * 2);--ui-lifted-shadow:0 0 0 var(--ui-border-width) color-mix(in srgb, var(--ui-text) 8%, transparent), 0 calc(var(--ui-step) * 3) calc(var(--ui-step) * 10) rgb(0 0 0 / 0.24);--ui-line-fill:var(--ui-accent);--ui-line-snap:0.0625rem;--ui-pill-radius:calc(infinity * 1rem);--ui-pressed-overlay:linear-gradient(color-mix(in srgb, currentColor 12%, transparent) 0 0);--ui-raised-background:color-mix(in srgb, var(--ui-accent) 12%, transparent);--ui-raised-color:var(--ui-accent);--ui-raised-shadow:none;--ui-scrim:var(--ui-background);--ui-text-body:0.875rem;--ui-text-display:2.25rem;--ui-text-heading:1rem;--ui-text-title:1.375rem;--ui-tint:color-mix(in srgb, var(--ui-accent) 70%, transparent);--ui-weight-heading:600;}
      [data-ui-style="voxel"]{--ui-block-opacity:1;--ui-border-width:var(--ui-step);--ui-container-radius:0;--ui-control-radius:0;--ui-focus-width:var(--ui-step);--ui-font-body:VT323, monospace;--ui-font-heading:VT323, monospace;--ui-font-mono:VT323, monospace;--ui-frame-shadow:0 calc(var(--ui-step) * -1) 0 0 var(--ui-border), 0 var(--ui-step) 0 0 var(--ui-border), calc(var(--ui-step) * -1) 0 0 0 var(--ui-border), var(--ui-step) 0 0 0 var(--ui-border), inset 0 var(--ui-step) 0 0 color-mix(in srgb, var(--ui-text) 8%, transparent);--ui-heading-color:var(--ui-accent);--ui-hover-filter:brightness(1.25);--ui-hover-overlay:none;--ui-indicator-width:calc(var(--ui-step) / 2);--ui-lifted-shadow:0 calc(var(--ui-step) * -1) 0 0 var(--ui-border), 0 var(--ui-step) 0 0 var(--ui-border), calc(var(--ui-step) * -1) 0 0 0 var(--ui-border), var(--ui-step) 0 0 0 var(--ui-border), inset 0 var(--ui-step) 0 0 color-mix(in srgb, var(--ui-text) 8%, transparent);--ui-line-fill:repeating-linear-gradient(to right, var(--ui-accent) 0 calc(var(--ui-step) * 4), transparent 0 calc(var(--ui-step) * 5));--ui-line-snap:calc(var(--ui-step) * 5);--ui-pill-radius:0;--ui-pressed-overlay:none;--ui-raised-background:var(--ui-border);--ui-raised-color:var(--ui-text);--ui-raised-shadow:inset calc(var(--ui-step) / -2) calc(var(--ui-step) / -2) 0 0 color-mix(in srgb, var(--ui-background) 45%, transparent), inset calc(var(--ui-step) / 2) calc(var(--ui-step) / 2) 0 0 color-mix(in srgb, var(--ui-text) 20%, transparent);--ui-scrim:repeating-conic-gradient(var(--ui-background) 0 25%, transparent 0 50%) 0 0 / calc(var(--ui-step) * 2) calc(var(--ui-step) * 2);--ui-text-body:calc(var(--ui-step) * 5);--ui-text-display:calc(var(--ui-step) * 12);--ui-text-heading:calc(var(--ui-step) * 6);--ui-text-title:calc(var(--ui-step) * 8);--ui-tint:var(--ui-accent);--ui-weight-heading:normal;}
      }"
    `);
  });

  // A pill and the surface it shapes each set a corner at the same specificity, so the pill's rule has to come later
  test("generates a shape after every surface it lays its corner over", async () => {
    expect.hasAssertions();

    const uno = await createGenerator(unoConfig);
    const { css } = await uno.generate("<div ui-field ui-frame ui-lifted ui-pill ui-raised />", {
      preflights: false,
      safelist: false,
    });
    // The forced-colours edges come after every surface and set no corner, so the order is read ahead of them
    const cornerCss = css.slice(0, css.indexOf("@media (forced-colors: active)"));

    expect(
      Array.from(cornerCss.matchAll(/^\[(?<name>ui-[a-z]+)=""\]\{/gmu), ({ groups }) => groups?.name),
    ).toStrictEqual(["ui-field", "ui-frame", "ui-lifted", "ui-raised", "ui-pill"]);
  });

  // Forced colours paint over every fill and drop every shadow, so a surface keeps its outline only through the
  // Transparent border it takes under them. Every rule that fills something is a surface, and must take one
  test("keeps an edge on every surface under forced colours", async () => {
    expect.hasAssertions();

    assert.exists(rules);

    const surfaceNames = rules.flatMap(([name, body]) =>
      typeof name === "string" &&
      [body]
        .flat()
        .some(
          (declarations) =>
            typeof declarations === "object" &&
            "background-color" in declarations &&
            declarations["background-color"] !== "transparent",
        )
        ? [name]
        : [],
    );
    const uno = await createGenerator(unoConfig);
    const { css } = await uno.generate(`<div ${surfaceNames.join(" ")} />`, { preflights: false, safelist: false });
    const forcedColorsBlock = css.slice(css.indexOf("@media (forced-colors: active)"));

    expect(
      Array.from(forcedColorsBlock.matchAll(/^\[(?<name>ui-[a-z]+)=""\]/gmu), ({ groups }) => groups?.name),
    ).toStrictEqual(surfaceNames);
  });

  // The pipeline scans components but not plain TypeScript, so a .ts file naming an icon opts in with the magic
  // Comment, and an icon the extractor cannot read out of its file draws nothing
  test("every icon named in source generates its rule", async () => {
    expect.hasAssertions();

    const uno = await createGenerator(unoConfig);
    const missingIcons: string[] = [];
    const iconChecks: Promise<string[]>[] = [];

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

      // Every file's generate is independent, so they are collected and awaited together
      iconChecks.push(
        (async () => {
          const { matched } = await uno.generate(code, { id: path, preflights: false, safelist: false });
          return icons.filter((icon) => !matched.has(icon)).map((icon) => `${path}: ${icon}`);
        })(),
      );
    }

    missingIcons.push(...(await Promise.all(iconChecks)).flat());

    expect(missingIcons).toStrictEqual([]);
  });
});
