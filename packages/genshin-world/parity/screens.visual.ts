import "@fontsource/signika/600.css";
import { getScreenBoxStyle, SCREEN_BOX_WIDTH } from "#parity/getScreenBoxStyle";
import { screens } from "#parity/screens";
import { capitalize, getResultAsync } from "@esposter/shared";
import {
  createVisualComparisonRecord,
  FIXTURE_IMAGE_NAME,
  FIXTURE_VARIANT_SEPARATOR,
  getFixtureImageName,
} from "genshin-interface";
import { afterAll, assert, beforeAll, describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";
import { defineComponent, h } from "vue";

// Each screen against its own image, `Index.png` in its own folder beside its `Index.vue` and `Index.fixture.ts`, and each
// Of its fixture's variants against one named after it, a moving screen held still by its fixture's `stillProps`. A
// Mismatch is listed after the cases rather than failed, and a missing image is written; `genshin:parity approve` writes an
// Image as a snapshot of the current render, beside the compare's score. Each is shot in the parity page's box, over a grey
// Backdrop, as the page draws it
// The grey a screen is drawn over in its box: the screens are drawn pale for the game's world, which a white backdrop hides,
// And a mid tone keeps both their light and their dark pieces visible
const SCREEN_BACKDROP_COLOR = "#4a5560";
// The window the box fills at its width, so the box's height is the window's and a unit is a pixel, as on the parity page
const SCREEN_BOX_HEIGHT = 1080;
const cases: ((typeof screens)[number] & { imageName: string; title: string })[] = [];
for (const screen of screens.filter(({ isMotionOnly }) => !isMotionOnly)) {
  cases.push({
    ...screen,
    imageName: FIXTURE_IMAGE_NAME,
    props: { ...screen.props, ...screen.stillProps },
    title: screen.name,
  });
  for (const [variant, variantProps] of Object.entries(screen.variants ?? {}))
    cases.push({
      ...screen,
      imageName: getFixtureImageName(variant),
      props: { ...screen.props, ...variantProps, ...screen.stillProps },
      title: `${screen.name}${FIXTURE_VARIANT_SEPARATOR}${variant}`,
    });
}

describe("interface screens", () => {
  // The window's size as the file opens it, put back once the cases are shot so the browser suite's other files keep theirs
  const viewportBefore = { height: window.innerHeight, width: window.innerWidth };
  const visualComparison = createVisualComparisonRecord();

  beforeAll(async () => {
    await page.viewport(SCREEN_BOX_WIDTH, SCREEN_BOX_HEIGHT);
  });

  afterAll(async () => {
    await page.viewport(viewportBefore.width, viewportBefore.height);
  });

  afterAll(() => {
    visualComparison.report();
  });

  test.for(cases)("$title", async ({ component, directory, imageName, props, readyEvent, title }) => {
    expect.hasAssertions();

    // The screen drawn the way the parity page draws it: in the page's box over the grey backdrop, so the image is the box
    // And not the body around it
    const { promise: ready, resolve: resolveReady } = Promise.withResolvers<void>();
    const readyProps = readyEvent ? { [`on${capitalize(readyEvent)}`]: resolveReady } : {};
    if (!readyEvent) resolveReady();
    const { container } = await render(
      defineComponent({
        render: () =>
          h(
            "div",
            { style: { ...getScreenBoxStyle(0), background: SCREEN_BACKDROP_COLOR } },
            h(component, { ...props, ...readyProps }),
          ),
      }),
    );
    await window.document.fonts.ready;
    await ready;

    const box = container.firstElementChild;
    assert(box);
    await getResultAsync(() =>
      expect.element(page.elementLocator(box)).toMatchScreenshot(`${directory}/${imageName}`),
    ).match(
      () => {
        visualComparison.recordWithinBar();
      },
      (error) => {
        visualComparison.recordFailure(error, title);
      },
    );
  });
});
