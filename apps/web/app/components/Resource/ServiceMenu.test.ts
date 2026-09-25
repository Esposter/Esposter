// @vitest-environment nuxt
import ResourceServiceMenu from "@/components/Resource/ServiceMenu.vue";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceServiceMenu", () => {
  test("renders nothing until it is opened", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceServiceMenu, { props: { modelValue: false } });

    expect(component.find("nav").exists()).toBe(false);
  });

  // The menu is navigation and nothing else, so the entry that was picked is also what closes it — leaving it open
  // Would sit over the page it just navigated to
  test("closes itself on the entry that was picked", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceServiceMenu, { props: { modelValue: true } });
    await takeOne(component.findAll("nav a")).trigger("click");

    expect(component.emitted("update:modelValue")).toStrictEqual([[false]]);
  });
});
