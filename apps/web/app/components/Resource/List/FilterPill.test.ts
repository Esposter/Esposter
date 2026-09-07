// @vitest-environment nuxt
import ResourceListFilterPill from "@/components/Resource/List/FilterPill.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceListFilterPill", () => {
  test("spells every pill's chip the same way", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceListFilterPill, { props: { label: "Status", value: "Published" } });

    expect(component.get(".v-chip").text()).toBe("Status == Published");
  });

  test("emits remove when the chip's close control is clicked", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceListFilterPill, {
      props: { isRemovable: true, label: "Status", value: "Published" },
    });
    await component.get("[data-testid=close-chip]").trigger("click");

    expect(component.emitted("remove")).toHaveLength(1);
  });

  // A pill whose body is a list of presets is done in one click, so it dismisses; one whose body is a form the
  // User types into has to survive clicking its own fields
  test("dismisses on a content click only when the pill opts in", async () => {
    expect.hasAssertions();

    const form = await mountSuspended(ResourceListFilterPill, { props: { label: "Tag", value: "all" } });
    const presets = await mountSuspended(ResourceListFilterPill, {
      props: { isClosedOnContentClick: true, label: "Status", value: "all" },
    });

    expect(form.findComponent({ name: "VMenu" }).props("closeOnContentClick")).toBe(false);
    expect(presets.findComponent({ name: "VMenu" }).props("closeOnContentClick")).toBe(true);
  });
});
