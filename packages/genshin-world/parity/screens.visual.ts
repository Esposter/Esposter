import { screens } from "#parity/screens";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

// Each screen against its own last approved image, kept in its section's `__screenshots__`; `pnpm test:visual -u` approves
// What it draws now
describe("interface screens", () => {
  test.for(screens)("$name", async ({ directory, load, name, props }) => {
    expect.hasAssertions();

    const component = await load();
    await render(component, { props });
    await window.document.fonts.ready;

    await expect.element(page.elementLocator(window.document.body)).toMatchScreenshot(`${directory}/${name}`);
  });
});
