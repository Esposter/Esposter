// @vitest-environment happy-dom
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import UiMenu from "@/components/Ui/Menu/Index.vue";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test } from "vitest";

describe("uiMenu", () => {
  const items: UiMenuItem<string>[] = [
    { title: "Copy", value: "copy" },
    { title: "Fork", value: "fork" },
    { title: "Rewind", value: "rewind" },
    { title: "Rewind files", value: "rewindFiles" },
  ];
  const label = "label";
  const mountMenu = async () => {
    const component = mount(UiMenu, { attachTo: document.body, props: { items, label } });
    const trigger = component.get("button");
    await trigger.trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    return { component, trigger };
  };

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("names its trigger and ties it to the menu it opens", () => {
    expect.hasAssertions();

    const component = mount(UiMenu, { props: { items, label } });
    const trigger = component.get("button");
    const menu = component.get('[role="menu"]');

    expect(trigger.attributes("aria-haspopup")).toBe("menu");
    expect(trigger.attributes("aria-label")).toBe(label);
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(trigger.attributes("popovertarget")).toBe(menu.attributes("id"));
    expect(trigger.attributes("aria-controls")).toBe(menu.attributes("id"));
    expect(menu.attributes("aria-label")).toBe(label);
  });

  test("opens on the down arrow onto its first item and on the up arrow onto its last", async () => {
    expect.hasAssertions();

    const { component, trigger } = await mountMenu();

    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(document.activeElement?.textContent.trim()).toBe("Copy");

    await component.get('[role="menu"]').trigger("keydown", { key: "Escape" });
    await trigger.trigger("keydown", { key: "ArrowUp" });
    await flushPromises();

    expect(document.activeElement?.textContent.trim()).toBe("Rewind files");
  });

  test("walks its items by arrow, Home and End, and jumps by a title's first letters", async () => {
    expect.hasAssertions();

    const { component } = await mountMenu();
    const menu = component.get('[role="menu"]');
    const press = async (key: string) => {
      await menu.trigger("keydown", { key });
      await flushPromises();
      return document.activeElement?.textContent.trim();
    };

    await expect(press("ArrowDown")).resolves.toBe("Fork");
    await expect(press("End")).resolves.toBe("Rewind files");
    await expect(press("ArrowDown")).resolves.toBe("Copy");
    await expect(press("Home")).resolves.toBe("Copy");
    await expect(press("r")).resolves.toBe("Rewind");
    await expect(press("r")).resolves.toBe("Rewind files");
    await expect(press("r")).resolves.toBe("Rewind");
  });

  test("picks the focused item on Enter, then closes with focus back on its trigger", async () => {
    expect.hasAssertions();

    const { component, trigger } = await mountMenu();
    await component.get('[role="menu"]').trigger("keydown", { key: "Enter" });

    expect(component.emitted<[string, KeyboardEvent]>("select")?.map(([value]) => value)).toStrictEqual(["copy"]);
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger.element);
  });

  test("reaches a disabled item and says so, but never picks it", async () => {
    expect.hasAssertions();

    const component = mount(UiMenu, {
      attachTo: document.body,
      props: { items: [{ isDisabled: true, title: "Copy", value: "copy" }], label },
    });
    const trigger = component.get("button");
    await trigger.trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    const item = component.get('[role="menuitem"]');

    expect(document.activeElement).toBe(item.element);
    expect(item.attributes("aria-disabled")).toBe("true");

    await component.get('[role="menu"]').trigger("keydown", { key: "Enter" });
    await item.trigger("click");

    expect(component.emitted("select")).toBeUndefined();
    expect(trigger.attributes("aria-expanded")).toBe("true");
  });

  test("closes on Escape with focus back on its trigger", async () => {
    expect.hasAssertions();

    const { component, trigger } = await mountMenu();
    await component.get('[role="menu"]').trigger("keydown", { key: "Escape" });

    expect(component.emitted("select")).toBeUndefined();
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger.element);
  });
});
