// @vitest-environment nuxt
import type { UiTabLink } from "@/models/ui/UiTabLink";

import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import UiTabLinks from "@/components/Ui/TabLinks.vue";
import { UiStyles } from "@/models/ui/UiStyle";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";
import { RouterLink } from "vue-router";

describe("uiTabLinks", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const items: UiTabLink[] = [
      { icon: "i-mdi:home", isCurrent: false, title: "first", to: "/" },
      { icon: "i-mdi:home", isCurrent: true, title: "second", to: "/second" },
    ];

    // The real RouterLink, which marks the link it is exactly on as current by itself: the first link here
    test("names its navigation and marks the current link alone, wherever the router is", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiTabLinks, {
        global: { components: { RouterLink } },
        props: { items, label },
        route: "/",
      });

      expect(component.get("nav").attributes("aria-label")).toBe(label);
      expect(
        component.findAll("a").map((link) => ({
          current: link.attributes("aria-current"),
          href: link.attributes("href"),
          title: link.text(),
        })),
      ).toStrictEqual([
        { current: undefined, href: "/", title: "first" },
        { current: "page", href: "/second", title: "second" },
      ]);
    });

    test("names each link by its title when it shows its icon alone", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiTabLinks, {
        props: { isIconOnly: true, items, label },
      });

      expect(
        component.findAll("a").map((link) => ({ label: link.attributes("aria-label"), text: link.text() })),
      ).toStrictEqual([
        { label: "first", text: "" },
        { label: "second", text: "" },
      ]);
    });
  });
});
