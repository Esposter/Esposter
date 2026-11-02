// @vitest-environment nuxt
import PageBuilderBackgroundLayers from "@/components/PageBuilder/StylePanel/BackgroundLayers.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("pageBuilderBackgroundLayers", () => {
  const TEST_LAYERS = "url(a), linear-gradient(red, blue)";
  const TEST_GRADIENT = "linear-gradient(red, blue)";

  test("removing a layer writes the layers that remain", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PageBuilderBackgroundLayers, { props: { modelValue: TEST_LAYERS } });
    const removeButton = component.findAll("button").find((button) => button.text() === "Remove");
    await removeButton?.trigger("click");

    expect(component.emitted("update:modelValue")?.at(-1)).toStrictEqual([TEST_GRADIENT]);
  });

  // A refused draft stays in its field, unsaved, and must stay there when an earlier layer is removed above it
  test("removing an earlier layer keeps a later layer's unsaved draft", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PageBuilderBackgroundLayers, { props: { modelValue: TEST_LAYERS } });
    const [, secondLayerInput] = component.findAll("input");
    await secondLayerInput?.setValue("{");
    const removeButton = component.findAll("button").find((button) => button.text() === "Remove");
    await removeButton?.trigger("click");

    expect(component.get("input").element.value).toBe("{");
  });

  test("an added layer is not written until it holds a value", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PageBuilderBackgroundLayers, { props: { modelValue: TEST_GRADIENT } });
    const addButton = component.findAll("button").find((button) => button.text() === "Add a layer");
    await addButton?.trigger("click");

    expect(component.emitted("update:modelValue")).toBeUndefined();
  });
});
