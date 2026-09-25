// @vitest-environment nuxt
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import ResourceSheetSettings from "@/components/Resource/Sheet/Settings.vue";
import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
import { useSheetStore } from "@/store/resource/sheet";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

const mountSettings = async () => {
  const sheetStore = useSheetStore();
  vi.spyOn(sheetStore, "loadContent").mockResolvedValue();
  const component = await mountSuspended(ResourceSheetSettings);
  await flushPromises();
  return { component, sheetStore };
};

describe("resourceSheetSettings", () => {
  test("swaps in a file type's default configuration when it is chosen", async () => {
    expect.hasAssertions();

    const { component, sheetStore } = await mountSettings();
    const radio = component
      .findAll('[role="radio"]')
      .find((option) => option.attributes("aria-label") === DataSourceType.Xlsx);
    await radio?.trigger("click");
    await flushPromises();

    expect(sheetStore.settings).toStrictEqual(createDefaultSheetSettings(DataSourceType.Xlsx));
    expect(component.find("input").exists()).toBe(true);

    component.unmount();
  });

  test("says a file type with no options has nothing to set", async () => {
    expect.hasAssertions();

    const { component, sheetStore } = await mountSettings();
    sheetStore.sheetResource.settings = createDefaultSheetSettings(DataSourceType.Json);
    await flushPromises();

    expect(component.find("input").exists()).toBe(false);
    expect(component.text()).toContain("Nothing to set");

    component.unmount();
  });
});
