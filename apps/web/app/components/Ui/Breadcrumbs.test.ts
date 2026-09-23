// @vitest-environment nuxt
import UiBreadcrumbs from "@/components/Ui/Breadcrumbs.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";
import { RouterLink } from "vue-router";

describe("uiBreadcrumbs", () => {
  test("is a navigation landmark of links in order, the marks between them hidden and nothing folded", async () => {
    expect.hasAssertions();

    const items = [
      { title: "a", to: "/a" },
      { title: "b", to: "/b" },
    ];
    // A crumb is a real link, so the trail needs the real RouterLink — mountSuspended otherwise swaps in a stub
    const component = await mountSuspended(UiBreadcrumbs, { global: { components: { RouterLink } }, props: { items } });
    const navigation = component.get("nav");

    expect(navigation.attributes("aria-label")).toBe("Breadcrumbs");
    expect(navigation.get("ol").attributes("role")).toBe("list");
    expect(navigation.findAll("a").map((link) => [link.text(), link.attributes("href")])).toStrictEqual([
      ["a", "/a"],
      ["b", "/b"],
    ]);
    expect(navigation.findAll('[aria-hidden="true"]').every((element) => !element.find("a").exists())).toBe(true);
    expect(navigation.get("button").attributes("aria-expanded")).toBe("false");
    expect(navigation.get("button").element.parentElement?.style.display).toBe("none");
  });
});
