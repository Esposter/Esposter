// @vitest-environment nuxt
import type { UiTabLink } from "@/models/ui/UiTabLink";

import UiTabLinks from "@/components/Ui/TabLinks.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";
import { RouterLink } from "vue-router";

describe("uiTabLinks", () => {
  const label = "label";
  const items: UiTabLink[] = [
    { isCurrent: false, title: "first", to: "/" },
    { isCurrent: true, title: "second", to: "/second" },
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
});
