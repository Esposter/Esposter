// @vitest-environment happy-dom
import type { UiCommand } from "@/models/ui/UiCommand";

import UiCommandList from "@/components/Ui/CommandList.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { takeOne } from "@esposter/shared";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("uiCommandList", () => {
  enableAutoUnmount(afterEach);

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const commands: UiCommand[] = [
      { group: "group", icon: "", id: "first", run: vi.fn<() => void>(), title: "first" },
      { group: "group", icon: "", id: "second", run: vi.fn<() => void>(), title: "second" },
      { group: "other", icon: "", id: "third", run: vi.fn<() => void>(), title: "third" },
    ];
    const mountCommandList = async () => {
      const component = mount(UiCommandList, {
        attachTo: document.body,
        props: { commands, label: "label", placeholder: "", query: "" },
      });
      await flushPromises();
      const field = component.get<HTMLInputElement>('[role="combobox"]');
      const getHighlightedTitle = () =>
        document.getElementById(field.attributes("aria-activedescendant") ?? "")?.textContent.trim();
      return { component, field, getHighlightedTitle };
    };

    test("ties its field to the list and highlights the first command, with one heading per group", async () => {
      expect.hasAssertions();

      const { component, field, getHighlightedTitle } = await mountCommandList();

      expect(field.attributes("aria-controls")).toBe(component.get('[role="listbox"]').attributes("id"));
      expect(getHighlightedTitle()).toBe("first");
      expect(component.findAll('[role="presentation"]').map((heading) => heading.text())).toStrictEqual([
        "group",
        "other",
      ]);
    });

    test("walks the list with the arrows while the field keeps focus, and picks with Enter", async () => {
      expect.hasAssertions();

      const { component, field, getHighlightedTitle } = await mountCommandList();
      field.element.focus();
      await field.trigger("keydown", { key: "ArrowDown" });
      await field.trigger("keydown", { key: "ArrowDown" });
      await field.trigger("keydown", { key: "ArrowUp" });

      expect(getHighlightedTitle()).toBe("second");
      expect(document.activeElement).toBe(field.element);

      await field.trigger("keydown", { key: "Enter" });

      expect(component.emitted("select")).toStrictEqual([[takeOne(commands, 1)]]);
    });

    test("marks the chosen member of a group of choices", () => {
      expect.hasAssertions();

      const component = mount(UiCommandList, {
        props: {
          commands: [
            { group: "group", icon: "", id: "first", isSelected: false, title: "first" },
            { group: "group", icon: "", id: "second", isSelected: true, title: "second" },
          ],
          label: "label",
          placeholder: "",
          query: "",
        },
      });

      expect(
        component.findAll('[role="option"]').map((option) => option.find('[aria-label="Chosen"]').exists()),
      ).toStrictEqual([false, true]);
    });
  });
});
