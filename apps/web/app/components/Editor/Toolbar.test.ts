// @vitest-environment happy-dom
import type { EditorToolbarGroup } from "@/models/editor/EditorToolbarGroup";
import type { EditorToolbarItem } from "@/models/editor/EditorToolbarItem";

import UiIcon from "@/components/Ui/Icon.vue";
import UiOverflowMenu from "@/components/Ui/OverflowMenu.vue";
import EditorToolbar from "@/components/Editor/Toolbar.vue";
import { EditorToolbarGroupKind } from "@/models/editor/EditorToolbarGroupKind";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { takeOne } from "@esposter/shared";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("editorToolbar", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const label = "label";
  const groupLabel = "group";
  const itemWidth = 1;
  const barWidth = 3;
  const tools = ["a", "b", "c", "d"].map((value) => ({ meaning: UiIconMeaning.Pointer, title: value, value }));
  const mountToolbar = (groups: EditorToolbarGroup[], modelValue: string) => {
    const component = mount(EditorToolbar, {
      attachTo: document.body,
      props: {
        groups,
        label,
        modelValue,
        "onUpdate:modelValue": (newModelValue: string) => component.setProps({ modelValue: newModelValue }),
      },
    });
    return component;
  };

  test("A group of tools is one tab stop", async () => {
    expect.hasAssertions();

    const firstTool = takeOne(tools, 0);
    const component = mountToolbar(
      [{ items: tools, kind: EditorToolbarGroupKind.Tool, label: groupLabel }],
      firstTool.value,
    );
    await flushPromises();
    const radios = component.findAll('[role="radio"]');
    const tabIndexes = radios.map((radio) => radio.attributes("tabindex"));
    await takeOne(radios, 0).trigger("keydown", { key: "ArrowRight" });
    await flushPromises();

    expect(tabIndexes).toStrictEqual(["0", "-1", "-1", "-1"]);
    expect(component.emitted("update:modelValue")).toStrictEqual([[takeOne(tools, 1).value]]);
  });

  test("Variants of a tool share one slot", async () => {
    expect.hasAssertions();

    const variants = [UiIconMeaning.Arrow, UiIconMeaning.Pen, UiIconMeaning.Hand].map((meaning, index) => ({
      meaning,
      title: `variant${index}`,
      value: `variant${index}`,
    }));
    const shape = { meaning: UiIconMeaning.Arrow, title: "shape", value: "shape", variants };
    const component = mountToolbar([{ items: [shape], kind: EditorToolbarGroupKind.Tool, label: groupLabel }], "");
    await flushPromises();
    await component.get('[data-toolbar-item="shape"]').trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    await takeOne(component.findAll('[role="menuitemradio"]'), 1).trigger("click");
    await flushPromises();
    const slot = component.get('[data-toolbar-item="shape"]');
    const slotIcon = component.findAllComponents(UiIcon).find((icon) => slot.element.contains(icon.element));

    expect(slotIcon?.props("meaning")).toBe(takeOne(variants, 1).meaning);
    expect(component.findAll('[data-toolbar-item="shape"]')).toHaveLength(1);
  });

  test("A toolbar folds what does not fit into one menu", async () => {
    expect.hasAssertions();

    const observe = vi.fn<(callback: ResizeObserverCallback) => void>();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: ResizeObserverCallback) {
          observe(callback);
        }

        disconnect() {}
        observe() {}
        unobserve() {}
      },
    );
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({ width: itemWidth } as DOMRect);
    const items = [
      { ...takeOne(tools, 0), isPinned: true },
      takeOne(tools, 1),
      takeOne(tools, 2),
      { ...takeOne(tools, 3), isPinned: true },
    ];
    const component = mountToolbar(
      [{ items, kind: EditorToolbarGroupKind.Tool, label: groupLabel }],
      takeOne(tools).value,
    );
    await flushPromises();
    const [callback] = takeOne(observe.mock.calls);
    callback([{ contentRect: { width: barWidth } }] as ResizeObserverEntry[], {} as ResizeObserver);
    await flushPromises();

    expect(component.findAll('[role="radio"]').map((radio) => radio.attributes("aria-label"))).toStrictEqual([
      takeOne(tools, 0).title,
      takeOne(tools, 3).title,
    ]);
    expect(component.findAllComponents(UiOverflowMenu)).toHaveLength(1);
    expect(
      component
        .findComponent(UiOverflowMenu)
        .props("items")
        .map(({ title }) => title),
    ).toStrictEqual([takeOne(tools, 1).title, takeOne(tools, 2).title]);
  });

  test("An unavailable tool says why", async () => {
    expect.hasAssertions();

    const reason = "reason";
    const component = mountToolbar(
      [
        {
          items: [takeOne(tools, 0), { ...takeOne(tools, 1), description: reason, isDisabled: true }],
          kind: EditorToolbarGroupKind.Tool,
          label: groupLabel,
        },
      ],
      takeOne(tools).value,
    );
    await flushPromises();
    const radio = takeOne(component.findAll('[role="radio"]'), 1);
    (radio.element as HTMLElement).focus();
    await flushPromises();

    expect(document.activeElement).toBe(radio.element);
    expect(component.get(`#${radio.attributes("aria-describedby")}`).text()).toBe(reason);
  });

  test("An unavailable command stays focusable and says why, and is not run", async () => {
    expect.hasAssertions();

    const reason = "reason";
    const onClick = vi.fn<NonNullable<EditorToolbarItem["onClick"]>>();
    const component = mountToolbar(
      [
        {
          items: [
            {
              description: reason,
              isDisabled: true,
              meaning: UiIconMeaning.Save,
              onClick,
              title: label,
              value: takeOne(tools).value,
            },
          ],
          kind: EditorToolbarGroupKind.Command,
          label: groupLabel,
        },
      ],
      "",
    );
    await flushPromises();
    const button = component.get(`[data-toolbar-item="${takeOne(tools).value}"]`);
    (button.element as HTMLElement).focus();
    await button.trigger("click");

    expect(document.activeElement).toBe(button.element);
    expect(component.get(`#${button.attributes("aria-describedby")}`).text()).toBe(reason);
    expect(onClick).not.toHaveBeenCalled();
  });
});
