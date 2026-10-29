import type { ComponentFixture } from "#src/models/ComponentFixture";
import type { Component } from "vue";

import "@fontsource/signika/600.css";
import GameScreen from "#src/components/GameScreen/Index.vue";
import { InteractionState } from "#src/models/InteractionState";
import { FIXTURE_VARIANT_SEPARATOR } from "#src/services/constants";
import { afterAll, assert, describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

// Every component folder's `Index.vue` with an `Index.fixture.ts` beside it, drawn alone at the middle of a game screen
// On a mid grey the game's pale and dark pieces both read against, shot to its own box and held to its own image,
// `Index.png` in the same folder, and each variant to one of its own named after it. A mismatch is listed after the cases
// Rather than failed, and a missing image is written by the run; a run with `-u` takes each render as its new image
const components = import.meta.glob<Component>("./*/Index.vue", { eager: true, import: "default" });
const fixtures = import.meta.glob<ComponentFixture>("./*/Index.fixture.ts", { eager: true });
// The screen root and the rect a piece is placed by draw nothing of their own, so they have no image to hold
const LAYOUT_COMPONENTS = new Set(["./GameRect/Index.vue", "./GameScreen/Index.vue", "./TwoColumnScreen/Index.vue"]);
const COMPONENT_FILE = "/Index.vue";
const IMAGE_NAME = "Index";
const STAGE_STYLE = { background: "#6b7280", display: "grid", placeItems: "center" };
// A mismatch over this share of an image is listed after the cases, one percent being the 99% likeness the screens are held to
const MISMATCH_RATIO_BAR = 0.01;
// The matcher's message for a shot that differs from its image, then the pixels that differ and their ratio
const MISMATCH_MESSAGE = "Screenshot does not match the stored reference.";
const MISMATCH_DETAIL_REGEX = /(?<pixels>\d+) pixels \(ratio (?<ratio>[\d.]+)\) differ/u;
// The matcher's message for a shot with no image beside it
const MISSING_IMAGE_MESSAGE = "No existing reference screenshot found";
const cases: { component: Component; imageName: string; props: Record<string, unknown>; slot?: string }[] = [];
for (const [path, { props, slot, variants = {} }] of Object.entries(fixtures)) {
  const componentPath = path.replace(/\.fixture\.ts$/u, ".vue");
  const component = components[componentPath];
  if (!component) continue;
  const imagePath = `${componentPath.slice("./".length, -COMPONENT_FILE.length)}/${IMAGE_NAME}`;
  cases.push({ component, imageName: imagePath, props, slot });
  for (const [variant, variantProps] of Object.entries(variants))
    cases.push({
      component,
      imageName: `${imagePath}${FIXTURE_VARIANT_SEPARATOR}${variant}`,
      props: { ...props, ...variantProps },
      slot,
    });
}
// A running animation is held at its end, or at its start when it never ends, so each image is one frame
const holdAnimations = (): void => {
  for (const animation of window.document.getAnimations()) {
    const { iterations } = animation.effect?.getComputedTiming() ?? {};
    if (iterations === Infinity) {
      animation.pause();
      animation.currentTime = 0;
    } else animation.finish();
  }
};

describe("genshin-interface components", () => {
  // The mismatches over the bar, each with its title, and the cases counted apart from them
  const overBar: { pixels: number; ratio: number; title: string }[] = [];
  let withinBarCount = 0;
  let withoutImageCount = 0;

  // A shot that differs from its image is listed in the summary, a missing image is counted apart, and any other failure
  // (a render error, a timeout) is thrown
  const recordComparison = (error: unknown, title: string): void => {
    if (!(error instanceof Error)) throw error;
    const detail = MISMATCH_DETAIL_REGEX.exec(error.message)?.groups;
    if (error.message.includes(MISSING_IMAGE_MESSAGE)) withoutImageCount += 1;
    else if (!detail || !error.message.includes(MISMATCH_MESSAGE)) throw error;
    else if (Number(detail.ratio) > MISMATCH_RATIO_BAR)
      overBar.push({ pixels: Number(detail.pixels), ratio: Number(detail.ratio), title });
    else withinBarCount += 1;
  };

  afterAll(() => {
    const summary = `${withinBarCount} within the bar${withoutImageCount > 0 ? `, ${withoutImageCount} with no image beside them` : ""}.`;
    if (overBar.length === 0) {
      console.log(`No case over ${MISMATCH_RATIO_BAR * 100}% of its image: ${summary}`);
      return;
    }

    // The matcher rounds each ratio up to a whole percent, so ties are ordered by the pixels that differ
    const rows = overBar
      .toSorted((first, second) => second.ratio - first.ratio || second.pixels - first.pixels)
      .map(({ ratio, title }) => `  ${String(Math.round(ratio * 100)).padStart(4)}%  ${title}`);
    console.log([`Cases over ${MISMATCH_RATIO_BAR * 100}% of their image, worst first:`, ...rows, summary].join("\n"));
  });

  test("every component but the layout ones has a fixture", () => {
    expect.hasAssertions();

    const componentPaths = Object.keys(components).filter((path) => !LAYOUT_COMPONENTS.has(path));
    const fixturePaths = new Set(Object.keys(fixtures).map((path) => path.replace(/\.fixture\.ts$/u, ".vue")));

    expect(componentPaths.filter((path) => !fixturePaths.has(path))).toStrictEqual([]);
  });

  test.for(cases)("$imageName", async ({ component, imageName, props, slot }) => {
    expect.hasAssertions();

    // A state the fixture forces is the stage's, which every button drawn on it takes
    const { interactionState, ...componentProps } = props;
    const { container } = await render(
      defineComponent({
        render: () =>
          h(
            GameScreen,
            {
              interactionState: Object.values(InteractionState).find((state) => state === interactionState),
              style: STAGE_STYLE,
            },
            () => h(component, componentProps, slot ? () => slot : undefined),
          ),
      }),
    );
    await window.document.fonts.ready;
    holdAnimations();

    // The component's own box alone, so its image is the component rather than the stage around it
    const element = container.querySelector(".game-screen")?.firstElementChild;
    assert(element);

    // The package does not depend on `@esposter/shared`, so a rejection is read from `allSettled` rather than neverthrow
    const [comparison] = await Promise.allSettled([
      expect.element(page.elementLocator(element)).toMatchScreenshot(imageName),
    ]);
    if (comparison.status === "fulfilled") withinBarCount += 1;
    else recordComparison(comparison.reason, imageName);
  });
});
