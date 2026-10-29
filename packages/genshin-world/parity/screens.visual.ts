import "@fontsource/signika/600.css";
import { getScreenBoxStyle, SCREEN_BOX_WIDTH } from "#parity/getScreenBoxStyle";
import { screens } from "#parity/screens";
import { capitalize, getResultAsync } from "@esposter/shared";
import { FIXTURE_VARIANT_SEPARATOR } from "genshin-interface";
import { afterAll, assert, beforeAll, describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";
import { defineComponent, h } from "vue";

// Each screen against its own image, `Index.png` in its own folder beside its `Index.vue` and `Index.fixture.ts`, and each
// Of its fixture's variants against one named after it, a moving screen held still by its fixture's `stillProps`. A
// Mismatch is listed after the cases rather than failed, and a missing image is written; `genshin:parity approve` writes an
// Image as a snapshot of the current render, beside the compare's score. Each is shot in the parity page's box, over a grey
// Backdrop, as the page draws it
const IMAGE_NAME = "Index";
// The grey a screen is drawn over in its box: the screens are drawn pale for the game's world, which a white backdrop hides,
// And a mid tone keeps both their light and their dark pieces visible
const SCREEN_BACKDROP_COLOR = "#4a5560";
// The window the box fills at its width, so the box's height is the window's and a unit is a pixel, as on the parity page
const SCREEN_BOX_HEIGHT = 1080;
// A mismatch over this share of an image is listed after the cases, one percent being the 99% likeness the screens are held to
const MISMATCH_RATIO_BAR = 0.01;
// The matcher's message for a shot that differs from its image, then the pixels that differ and their ratio
const MISMATCH_MESSAGE = "Screenshot does not match the stored reference.";
const MISMATCH_DETAIL_REGEX = /(?<pixels>\d+) pixels \(ratio (?<ratio>[\d.]+)\) differ/u;
// The matcher's message for a shot with no image beside it, which the run writes when it may and otherwise leaves unwritten
const MISSING_IMAGE_MESSAGE = "No existing reference screenshot found";
const cases: ((typeof screens)[number] & { imageName: string; title: string })[] = [];
for (const screen of screens.filter(({ isMotionOnly }) => !isMotionOnly)) {
  cases.push({
    ...screen,
    imageName: IMAGE_NAME,
    props: { ...screen.props, ...screen.stillProps },
    title: screen.name,
  });
  for (const [variant, variantProps] of Object.entries(screen.variants ?? {}))
    cases.push({
      ...screen,
      imageName: `${IMAGE_NAME}${FIXTURE_VARIANT_SEPARATOR}${variant}`,
      props: { ...screen.props, ...variantProps, ...screen.stillProps },
      title: `${screen.name}${FIXTURE_VARIANT_SEPARATOR}${variant}`,
    });
}

describe("interface screens", () => {
  // The window's size as the file opens it, put back once the cases are shot so the browser suite's other files keep theirs
  const viewportBefore = { height: window.innerHeight, width: window.innerWidth };
  // The mismatches over the bar, each with its title, and the cases counted apart from them
  const overBar: { pixels: number; ratio: number; title: string }[] = [];
  let withinBarCount = 0;
  let withoutImageCount = 0;

  beforeAll(async () => {
    await page.viewport(SCREEN_BOX_WIDTH, SCREEN_BOX_HEIGHT);
  });

  afterAll(async () => {
    await page.viewport(viewportBefore.width, viewportBefore.height);
  });

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
        withinBarCount += 1;
      },
      (error) => {
        const detail = MISMATCH_DETAIL_REGEX.exec(error.message)?.groups;
        if (error.message.includes(MISSING_IMAGE_MESSAGE)) withoutImageCount += 1;
        else if (!detail || !error.message.includes(MISMATCH_MESSAGE)) throw error;
        else if (Number(detail.ratio) > MISMATCH_RATIO_BAR)
          overBar.push({ pixels: Number(detail.pixels), ratio: Number(detail.ratio), title });
        else withinBarCount += 1;
      },
    );
  });
});
