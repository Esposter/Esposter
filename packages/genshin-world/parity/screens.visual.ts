import "@fontsource/signika/600.css";
import { screens } from "#parity/screens";
import { capitalize, getResultAsync } from "@esposter/shared";
import { FIXTURE_VARIANT_SEPARATOR } from "genshin-interface";
import { afterAll, describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

// Each screen against its own image, `Index.png` in its own folder beside its `Index.vue` and `Index.fixture.ts`, and each
// Of its fixture's variants against one named after it, a moving screen held still by its fixture's `stillProps`. A
// Mismatch is listed after the cases rather than failed, and a missing image is written; `genshin:parity approve` writes an
// Image as a snapshot of the current render, beside the compare's score
const IMAGE_NAME = "Index";
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
  // The mismatches over the bar, each with its title, and the cases counted apart from them
  const overBar: { pixels: number; ratio: number; title: string }[] = [];
  let withinBarCount = 0;
  let withoutImageCount = 0;

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

    const { promise: ready, resolve: resolveReady } = Promise.withResolvers<void>();
    if (readyEvent) await render(component, { attrs: { [`on${capitalize(readyEvent)}`]: resolveReady }, props });
    else {
      await render(component, { props });
      resolveReady();
    }
    await window.document.fonts.ready;
    await ready;

    await getResultAsync(() =>
      expect.element(page.elementLocator(window.document.body)).toMatchScreenshot(`${directory}/${imageName}`),
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
