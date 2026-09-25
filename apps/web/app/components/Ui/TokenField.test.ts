// @vitest-environment nuxt
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import UiTokenField from "@/components/Ui/TokenField.vue";
import { UiStyles } from "@/models/ui/UiStyle";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { enableAutoUnmount, flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test } from "vitest";

describe("uiTokenField", () => {
  enableAutoUnmount(afterEach);

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const tokens = ["a", "b"];
    const mountTokenField = (text = "") =>
      mountSuspended(UiTokenField<string>, {
        attachTo: document.body,
        props: { getTokenTitle: (token) => token, label, text, tokens },
        slots: { panel: () => h("button", { type: "button" }, "panel") },
      });

    test("names its text by its label and draws each token with a button that removes it", async () => {
      expect.hasAssertions();

      const component = await mountTokenField();
      await component.get('[aria-label="Remove a"]').trigger("click");

      expect(component.get("input").attributes("aria-label")).toBe(label);
      expect(component.emitted("update:tokens")).toStrictEqual([[["b"]]]);
    });

    test("takes the last token back on Backspace in empty text, and keeps it while there is text", async () => {
      expect.hasAssertions();

      const component = await mountTokenField();
      await component.get("input").trigger("keydown", { key: "Backspace" });
      await component.setProps({ text: label });
      await component.get("input").trigger("keydown", { key: "Backspace" });

      expect(component.emitted("update:tokens")).toStrictEqual([[["a"]]]);
    });

    test("opens its panel as the text is focused, submits on Enter, and closes on Escape", async () => {
      expect.hasAssertions();

      const component = await mountTokenField();
      const input = component.get("input");
      await input.trigger("focus");
      await flushPromises();

      expect(input.attributes("aria-expanded")).toBe("true");

      await input.trigger("keydown", { key: "Enter" });
      await input.trigger("keydown", { key: "Escape" });
      await flushPromises();

      expect(component.emitted("submit")).toHaveLength(1);
      expect(input.attributes("aria-expanded")).toBe("false");
    });

    test("closes its panel on Escape in the panel and returns to the text", async () => {
      expect.hasAssertions();

      const component = await mountTokenField();
      const input = component.get("input");
      await input.trigger("focus");
      await flushPromises();
      const button = component.get('[role="dialog"] button');
      (button.element as HTMLButtonElement).focus();
      await button.trigger("keydown", { key: "Escape" });
      await flushPromises();

      expect(document.activeElement).toBe(input.element);
      expect(input.attributes("aria-expanded")).toBe("false");
    });
  });
});
