import type { ComponentFixture } from "#src/models/ComponentFixture";
import type { Component } from "vue";

import "@fontsource/signika/600.css";
import GameScreen from "#src/components/GameScreen/Index.vue";
import { InteractionState } from "#src/models/InteractionState";
import { FIXTURE_IMAGE_NAME, getFixtureImageName } from "#src/services/constants";
import { assertSettledRender } from "#src/services/assertSettledRender";
import { createVisualComparisonRecord } from "#src/services/createVisualComparisonRecord";
import { afterAll, assert, describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

// Every component folder's `Index.vue` with an `Index.fixture.ts` beside it, drawn alone at the middle of a game screen
// On a mid grey the game's pale and dark pieces both read against, shot to its own box and held to its own image,
// `Index.png` in the same folder, and each variant to one of its own named after it. A mismatch is listed after the cases
// Rather than failed, and a missing image is written by the run; a run with `-u` takes each render as its new image
// Set by the browser config from the run's update flag (`vitest.browser.config.ts`)
declare const IS_VISUAL_UPDATE: boolean;
const components = import.meta.glob<Component>("./*/Index.vue", { eager: true, import: "default" });
const fixtures = import.meta.glob<ComponentFixture>("./*/Index.fixture.ts", { eager: true });
// The screen root and the rect a piece is placed by draw nothing of their own, so they have no image to hold
const LAYOUT_COMPONENTS = new Set(["./GameRect/Index.vue", "./GameScreen/Index.vue", "./TwoColumnScreen/Index.vue"]);
const COMPONENT_FILE = "/Index.vue";
const STAGE_STYLE = { background: "#6b7280", display: "grid", placeItems: "center" };
const cases: { component: Component; imageName: string; props: Record<string, unknown>; slot?: string }[] = [];
for (const [path, { props, slot, variants = {} }] of Object.entries(fixtures)) {
  const componentPath = path.replace(/\.fixture\.ts$/u, ".vue");
  const component = components[componentPath];
  if (!component) continue;
  const directory = componentPath.slice("./".length, -COMPONENT_FILE.length);
  cases.push({ component, imageName: `${directory}/${FIXTURE_IMAGE_NAME}`, props, slot });
  for (const [variant, variantProps] of Object.entries(variants))
    cases.push({
      component,
      imageName: `${directory}/${getFixtureImageName(variant)}`,
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
  const visualComparison = createVisualComparisonRecord();

  afterAll(() => {
    visualComparison.report();
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
      (async () => {
        // The update path writes what the matcher captured, so a render still changing across frames is refused before it
        if (IS_VISUAL_UPDATE) await assertSettledRender(page.elementLocator(element), imageName);
        await expect.element(page.elementLocator(element)).toMatchScreenshot(imageName);
      })(),
    ]);
    if (comparison.status === "fulfilled") visualComparison.recordWithinBar();
    else visualComparison.recordFailure(comparison.reason, imageName);
  });
});
