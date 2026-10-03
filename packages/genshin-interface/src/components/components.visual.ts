import type { ComponentFixture } from "#src/models/ComponentFixture";
import type { Component } from "vue";

import "@fontsource/signika/600.css";
import GameScreen from "#src/components/GameScreen/Index.vue";
import { FIXTURE_VARIANT_SEPARATOR } from "#src/services/constants";
import { assert, describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

// Every component folder's `Index.vue` with an `Index.fixture.ts` beside it, drawn alone at the middle of a game screen
// On a mid grey the game's pale and dark pieces both read against, shot to its own box and held to its own last
// Approved image, `Index.<platform>.png` in the same folder, and each variant to one of its own named after it.
// `pnpm test:visual -u` approves what they draw now
const components = import.meta.glob<Component>("./*/Index.vue", { eager: true, import: "default" });
const fixtures = import.meta.glob<ComponentFixture>("./*/Index.fixture.ts", { eager: true });
// The screen root and the rect a piece is placed by draw nothing of their own, so they have no image to hold
const LAYOUT_COMPONENTS = new Set(["./GameRect/Index.vue", "./GameScreen/Index.vue"]);
const COMPONENT_FILE = "/Index.vue";
const IMAGE_NAME = "Index";
const STAGE_STYLE = { background: "#6b7280", display: "grid", placeItems: "center" };
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
  test("every component but the layout ones has a fixture", () => {
    expect.hasAssertions();

    const componentPaths = Object.keys(components).filter((path) => !LAYOUT_COMPONENTS.has(path));
    const fixturePaths = new Set(Object.keys(fixtures).map((path) => path.replace(/\.fixture\.ts$/u, ".vue")));

    expect(componentPaths.filter((path) => !fixturePaths.has(path))).toStrictEqual([]);
  });

  test.for(cases)("$imageName", async ({ component, imageName, props, slot }) => {
    expect.hasAssertions();

    const { container } = await render(
      defineComponent({
        render: () => h(GameScreen, { style: STAGE_STYLE }, () => h(component, props, slot ? () => slot : undefined)),
      }),
    );
    await window.document.fonts.ready;
    holdAnimations();

    // The component's own box alone, so its image is the component rather than the stage around it
    const element = container.querySelector(".game-screen")?.firstElementChild;
    assert(element);

    await expect.element(page.elementLocator(element)).toMatchScreenshot(imageName);
  });
});
