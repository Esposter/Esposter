// @vitest-environment nuxt
import ResourceListFilterPill from "@/components/Resource/List/FilterPill.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceListFilterPill", () => {
  const label = "label";
  const value = "value";

  test("names every pill by what it filters and what it holds", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceListFilterPill, { props: { label, value } });

    expect(component.get("button[aria-expanded]").attributes("aria-label")).toBe(`${label}: ${value}`);
  });

  test("emits remove from its own remove mark", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceListFilterPill, { props: { isRemovable: true, label, value } });
    await component.get(`button[aria-label="Remove the ${label} filter"]`).trigger("click");

    expect(component.emitted("remove")).toStrictEqual([[]]);
  });
});
