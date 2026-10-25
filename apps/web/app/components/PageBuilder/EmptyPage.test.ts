// @vitest-environment nuxt
import PageBuilderEmptyPage from "@/components/PageBuilder/EmptyPage.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("pageBuilderEmptyPage", () => {
  test("an empty page names the palette rather than drawing a second one", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PageBuilderEmptyPage);

    expect(component.text()).toContain("Add a block from the palette on the left to start.");
    expect(component.findAll("button")).toHaveLength(0);

    component.unmount();
  });
});
