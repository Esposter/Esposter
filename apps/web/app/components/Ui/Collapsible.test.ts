// @vitest-environment happy-dom
import UiCollapsible from "@/components/Ui/Collapsible.vue";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiCollapsible", () => {
  const title = "title";
  const content = "content";
  const mountCollapsible = (modelValue: boolean) =>
    mount(UiCollapsible, { props: { modelValue }, slots: { default: content, title } });

  test("ties its trigger to the content it shows, which is no landmark", () => {
    expect.hasAssertions();

    const component = mountCollapsible(true);
    const trigger = component.get("button");
    const panel = component.get(`#${trigger.attributes("aria-controls")}`);

    expect(trigger.text()).toBe(title);
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(panel.text()).toBe(content);
    expect(panel.attributes("hidden")).toBeUndefined();
    expect(panel.attributes("role")).toBeUndefined();
  });

  test("hides its content while closed and toggles its model when pressed", async () => {
    expect.hasAssertions();

    const component = mountCollapsible(false);
    const trigger = component.get("button");

    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(component.get(`#${trigger.attributes("aria-controls")}`).attributes("hidden")).toBe("");

    await trigger.trigger("click");
    await flushPromises();

    expect(component.emitted<[boolean]>("update:modelValue")).toStrictEqual([[true]]);
  });

  test("keeps its actions beside the trigger rather than inside it", () => {
    expect.hasAssertions();

    const component = mount(UiCollapsible, {
      props: { modelValue: true },
      slots: { actions: "<a href>actions</a>", default: content, title },
    });

    expect(component.get("button").text()).toBe(title);
    expect(component.find("button a").exists()).toBe(false);
    expect(component.find("a").text()).toBe("actions");
  });
});
