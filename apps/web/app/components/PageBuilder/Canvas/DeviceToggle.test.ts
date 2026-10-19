// @vitest-environment happy-dom
import PageBuilderCanvasDeviceToggle from "@/components/PageBuilder/Canvas/DeviceToggle.vue";
import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("pageBuilderCanvasDeviceToggle", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("the device toggle sets the canvas device for the resource", async () => {
    expect.hasAssertions();

    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const component = mount(PageBuilderCanvasDeviceToggle, { attachTo: document.body, props: { resourceId: TEST_ID } });
    await flushPromises();
    const tablet = component.findAll('[role="radio"]').find((option) => option.text() === "Tablet");
    await tablet?.trigger("click");

    expect(pageBuilderCanvasStore.getDevice(TEST_ID)).toBe(PageBuilderDevice.Tablet);
  });
});
