// @vitest-environment nuxt
import UiAvatar from "@/components/Ui/Avatar.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("uiAvatar", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const image = "/image.png";
    const name = "name";
    let hydratingNuxtApp: ReturnType<typeof useNuxtApp> | undefined;

    afterEach(() => {
      if (hydratingNuxtApp) {
        hydratingNuxtApp.isHydrating = false;
        hydratingNuxtApp = undefined;
      }
      vi.restoreAllMocks();
    });

    test("shows the name's first letter, hidden from assistive technology, until an image loads", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiAvatar, { attachTo: document.body, props: { image, name } });
      const fallback = component.get('[aria-hidden="true"]');

      expect(fallback.text()).toBe("N");
      expect(component.get("img").isVisible()).toBe(false);
    });

    test("swaps the letter for the image once it loads", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiAvatar, { attachTo: document.body, props: { image, name } });
      await component.get("img").trigger("load");

      expect(component.find('[aria-hidden="true"]').exists()).toBe(false);
      expect(component.get("img").isVisible()).toBe(true);
    });

    test("shows the image a server render finished loading before hydration", async () => {
      expect.hasAssertions();

      vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
      const component = await mountSuspended(
        defineComponent({
          render: () => h(UiAvatar, { image, name }),
          setup: () => {
            hydratingNuxtApp = useNuxtApp();
            hydratingNuxtApp.isHydrating = true;
          },
        }),
        { attachTo: document.body },
      );

      expect(component.find('[aria-hidden="true"]').exists()).toBe(false);
      expect(component.get("img").isVisible()).toBe(true);
    });
  });
});
