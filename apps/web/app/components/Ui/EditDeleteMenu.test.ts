// @vitest-environment happy-dom
import UiEditDeleteMenu from "#src/components/Ui/EditDeleteMenu.vue";
import { setupUiStyle } from "#src/components/Ui/setupUiStyle.test";
import { UiStyles } from "#src/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiEditDeleteMenu", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const editLabel = "editLabel";
    const deleteLabel = "deleteLabel";

    test("lists Edit above a Delete drawn in the error colour, under the trigger's label", async () => {
      expect.hasAssertions();

      const component = mount(UiEditDeleteMenu, { attachTo: document.body, props: { deleteLabel, editLabel, label } });
      const trigger = component.get("button");

      expect(trigger.attributes("aria-label")).toBe(label);

      await trigger.trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      const items = component.get('[role="menu"]').findAll('[role="menuitem"]');

      expect(items.map((item) => item.text())).toStrictEqual([editLabel, deleteLabel]);
      expect(items.map((item) => item.classes("text-error"))).toStrictEqual([false, true]);
    });

    test("emits edit alone when Edit is picked from the keyboard", async () => {
      expect.hasAssertions();

      const component = mount(UiEditDeleteMenu, { attachTo: document.body, props: { deleteLabel, editLabel, label } });

      await component.get("button").trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      await component.get('[role="menu"]').trigger("keydown", { key: "Enter" });
      await flushPromises();

      expect(component.emitted("edit")).toStrictEqual([[]]);
      expect(component.emitted("delete")).toBeUndefined();
    });

    test("emits delete alone when Delete is picked from the keyboard", async () => {
      expect.hasAssertions();

      const component = mount(UiEditDeleteMenu, { attachTo: document.body, props: { deleteLabel, editLabel, label } });

      await component.get("button").trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      await component.get('[role="menu"]').trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      await component.get('[role="menu"]').trigger("keydown", { key: "Enter" });
      await flushPromises();

      expect(component.emitted("delete")).toStrictEqual([[]]);
      expect(component.emitted("edit")).toBeUndefined();
    });
  });
});
