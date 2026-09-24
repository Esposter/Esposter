// @vitest-environment happy-dom
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import UiSuggestions from "@/components/Ui/Suggestions.vue";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("uiSuggestions", () => {
  const items: UiMenuItem<string>[] = [
    { title: "/compact", value: "compact" },
    { title: "/context", value: "context" },
  ];
  const label = "label";
  const mountSuggestions = async () => {
    const field = document.createElement("textarea");
    document.body.append(field);
    const component = mount(UiSuggestions, { attachTo: document.body, props: { field, items, label } });
    field.focus();
    await flushPromises();
    const press = (key: string) => {
      const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key });
      field.dispatchEvent(event);
      return event;
    };
    return { component, field, press };
  };

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("ties the field to its list, which keeps focus while the arrows walk it", async () => {
    expect.hasAssertions();

    const { component, field, press } = await mountSuggestions();
    const listbox = component.get('[role="listbox"]');
    press("ArrowDown");
    await flushPromises();
    press("ArrowDown");
    await flushPromises();

    expect(field.getAttribute("aria-controls")).toBe(listbox.attributes("id"));
    expect(field.getAttribute("aria-autocomplete")).toBe("list");
    expect(document.activeElement).toBe(field);
    expect(document.getElementById(field.getAttribute("aria-activedescendant") ?? "")?.textContent.trim()).toBe(
      "/context",
    );
  });

  test("leaves Enter to the field until a suggestion is highlighted, then takes it prevented", async () => {
    expect.hasAssertions();

    const { component, field, press } = await mountSuggestions();
    const onFieldKeydown = vi.fn<(event: KeyboardEvent) => void>();
    field.addEventListener("keydown", onFieldKeydown);
    press("Enter");
    press("ArrowDown");
    await flushPromises();
    press("Enter");

    expect(onFieldKeydown.mock.calls.map(([{ defaultPrevented, key }]) => [key, defaultPrevented])).toStrictEqual([
      ["Enter", false],
      ["ArrowDown", true],
      ["Enter", true],
    ]);
    expect(component.emitted("select")).toStrictEqual([["compact"]]);
  });

  test("puts itself away on Escape without the key reaching the page", async () => {
    expect.hasAssertions();

    const { field, press } = await mountSuggestions();
    const onWindowKeydown = vi.fn<(event: KeyboardEvent) => void>();
    window.addEventListener("keydown", onWindowKeydown);
    press("ArrowDown");
    await flushPromises();
    const event = press("Escape");
    await flushPromises();
    press("ArrowDown");
    await flushPromises();
    window.removeEventListener("keydown", onWindowKeydown);

    expect(event.defaultPrevented).toBe(true);
    expect(onWindowKeydown.mock.calls.map(([{ key }]) => key)).toStrictEqual(["ArrowDown", "ArrowDown"]);
    expect(field.hasAttribute("aria-activedescendant")).toBe(false);
  });
});
