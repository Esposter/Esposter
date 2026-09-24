// @vitest-environment happy-dom
import UiCollapsible from "@/components/Ui/Collapsible.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

describe("uiCollapsible", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

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

    test("hands its header row what the call site gives it, around the trigger and the actions", async () => {
      expect.hasAssertions();

      const onContextmenu = vi.fn<(event: MouseEvent) => void>();
      const component = mount(UiCollapsible, {
        props: { headerAttrs: { onContextmenu }, modelValue: true },
        slots: { default: content, title },
      });
      await component.get("button").trigger("contextmenu");

      expect(onContextmenu).toHaveBeenCalledTimes(1);
    });
  });
});
