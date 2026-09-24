// @vitest-environment happy-dom
import UiAvatar from "@/components/Ui/Avatar.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiAvatar", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const name = "name";

    test("shows the name's first letter, hidden from assistive technology, until an image loads", async () => {
      expect.hasAssertions();

      const component = mount(UiAvatar, { props: { name } });
      await flushPromises();
      const fallback = component.get('[aria-hidden="true"]');

      expect(fallback.text()).toBe("N");
    });
  });
});
