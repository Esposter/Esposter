import "@fontsource/signika/600.css";
import { screens } from "#parity/screens";
import { capitalize } from "@esposter/shared";
import { FIXTURE_VARIANT_SEPARATOR } from "genshin-ui";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

// Each screen against its own last approved image, `Index.<platform>.png` in its own folder beside its `Index.vue` and
// `Index.fixture.ts`, and each of its fixture's variants against one of its own named after it; `pnpm test:visual -u`
// Approves what it draws now
const IMAGE_NAME = "Index";
const cases: ((typeof screens)[number] & { imageName: string; title: string })[] = [];
for (const screen of screens.filter(({ isMotionOnly }) => !isMotionOnly)) {
  cases.push({ ...screen, imageName: IMAGE_NAME, title: screen.name });
  for (const [variant, variantProps] of Object.entries(screen.variants ?? {}))
    cases.push({
      ...screen,
      imageName: `${IMAGE_NAME}${FIXTURE_VARIANT_SEPARATOR}${variant}`,
      props: { ...screen.props, ...variantProps },
      title: `${screen.name}${FIXTURE_VARIANT_SEPARATOR}${variant}`,
    });
}

describe("interface screens", () => {
  test.for(cases)("$title", async ({ component, directory, imageName, props, readyEvent }) => {
    expect.hasAssertions();

    const { promise: ready, resolve: resolveReady } = Promise.withResolvers<void>();
    if (readyEvent) await render(component, { attrs: { [`on${capitalize(readyEvent)}`]: resolveReady }, props });
    else {
      await render(component, { props });
      resolveReady();
    }
    await window.document.fonts.ready;
    await ready;

    await expect.element(page.elementLocator(window.document.body)).toMatchScreenshot(`${directory}/${imageName}`);
  });
});
