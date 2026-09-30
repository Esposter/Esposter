import "@fontsource/signika/600.css";
import { screens } from "#parity/screens";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

// Each screen against its own last approved image, kept in its section's `__screenshots__`; `pnpm test:visual -u` approves
// What it draws now
describe("interface screens", () => {
  test.for(screens.filter(({ isMotionOnly }) => !isMotionOnly))(
    "$name",
    async ({ directory, load, name, props, readyEvent }) => {
      expect.hasAssertions();

      const component = await load();
      const { promise: ready, resolve: resolveReady } = Promise.withResolvers<void>();
      if (readyEvent)
        await render(component, {
          attrs: { [`on${readyEvent.charAt(0).toUpperCase()}${readyEvent.slice(1)}`]: resolveReady },
          props,
        });
      else {
        await render(component, { props });
        resolveReady();
      }
      await window.document.fonts.ready;
      await ready;

      await expect.element(page.elementLocator(window.document.body)).toMatchScreenshot(`${directory}/${name}`);
    },
  );
});
