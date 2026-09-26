// @vitest-environment nuxt
import UiAvatar from "@/components/Ui/Avatar.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("uiAvatar", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const image = "/image.png";
    const name = "name";

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
  });
});
