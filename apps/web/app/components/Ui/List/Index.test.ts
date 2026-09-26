// @vitest-environment nuxt
import type { UiListItem } from "@/models/ui/UiListItem";

import UiAvatar from "@/components/Ui/Avatar.vue";
import UiList from "@/components/Ui/List/Index.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { assert, describe, expect, test } from "vitest";
import { RouterLink } from "vue-router";

const getFocusedTitle = () => document.activeElement?.textContent.trim();
const press = async (key: string) => {
  assert.exists(document.activeElement);
  document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key }));
  await flushPromises();
  return getFocusedTitle();
};

describe("uiList", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const group = "group";
    const image = "/image";
    const title = "title";
    const items: UiListItem<string>[] = [
      { icon: "", title: "a", value: "a" },
      { icon: "", title: "b", value: "b" },
      { icon: "", title: "ba", value: "ba" },
    ];

    test("is a named list of links and buttons, one stop in the tab order on the current row", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiList<string>, {
        global: { components: { RouterLink } },
        props: {
          items: [
            { icon: "", title: "a", value: "a" },
            { icon: "", isCurrent: true, title: "b", to: "/", value: "b" },
          ],
          label,
        },
        route: "/",
      });
      const list = component.get('[role="list"]');

      expect(list.attributes("aria-label")).toBe(label);
      expect(
        list
          .findAll('[role="listitem"] > :first-child')
          .map((row) => ({
            current: row.attributes("aria-current"),
            href: row.attributes("href"),
            tabindex: row.attributes("tabindex"),
            tag: row.element.tagName,
          })),
      ).toStrictEqual([
        { current: undefined, href: undefined, tabindex: "-1", tag: "BUTTON" },
        { current: "page", href: "/", tabindex: "0", tag: "A" },
      ]);
    });

    test("walks its rows by arrow, Home and End, and jumps by a title's first letters", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiList<string>, { attachTo: document.body, props: { items, label } });
      const list = component.get('[role="list"]');
      const firstRow = list.get("button");
      firstRow.element.focus();

      await expect(press("ArrowDown")).resolves.toBe("b");
      await expect(press("End")).resolves.toBe("ba");
      await expect(press("ArrowDown")).resolves.toBe("ba");
      await expect(press("Home")).resolves.toBe("a");
      await expect(press("b")).resolves.toBe("b");
      await expect(press("b")).resolves.toBe("ba");
    });

    test("picks a row by click", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiList<string>, { props: { items, label } });
      await component.get("button").trigger("click");

      expect(component.emitted<[string, MouseEvent]>("select")?.map(([value]) => value)).toStrictEqual(["a"]);
    });

    test.each([
      ["one option", undefined, "false"],
      ["several options", true, "true"],
    ] as const)(
      "holding a selection of %s, is a listbox whose options say whether they are selected",
      async (_selection, isMultiple, multiselectable) => {
        expect.hasAssertions();

        const component = await mountSuspended(UiList<string>, {
          props: { isMultiple, items, label, modelValue: ["b"] },
        });
        const listbox = component.get('[role="listbox"]');

        expect(listbox.attributes("aria-label")).toBe(label);
        expect(listbox.attributes("aria-multiselectable")).toBe(multiselectable);
        expect(
          listbox
            .findAll('[role="option"]')
            .map((option) => ({
              selected: option.attributes("aria-selected"),
              tabindex: option.attributes("tabindex"),
            })),
        ).toStrictEqual([
          { selected: "false", tabindex: "-1" },
          { selected: "true", tabindex: "0" },
          { selected: "false", tabindex: "-1" },
        ]);
      },
    );

    test.each([
      ["one option", undefined, [["b"], ["a"], ["ba"]]],
      ["several options", true, [["a", "b"], ["b"], ["b", "ba"]]],
    ] as const)("selects %s by click, Enter and Space", async (_selection, isMultiple, modelValues) => {
      expect.hasAssertions();

      const component = await mountSuspended(UiList<string>, {
        attachTo: document.body,
        props: {
          isMultiple,
          items,
          label,
          modelValue: ["a"],
          "onUpdate:modelValue": (modelValue: string[] | undefined) => component.setProps({ modelValue }),
        },
      });
      const [first, second, third] = component.findAll('[role="option"]');
      await second?.trigger("click");
      await first?.trigger("keydown", { key: "Enter" });
      await third?.trigger("keydown", { key: " " });

      expect(component.emitted<[string[]]>("update:modelValue")?.map(([modelValue]) => modelValue)).toStrictEqual(
        modelValues,
      );
    });

    test("draws a danger row in the error colour, as a list row and as an option", async () => {
      expect.hasAssertions();

      const dangerItems: UiListItem<string>[] = [{ icon: "", isDanger: true, title: "a", value: "a" }];
      const list = await mountSuspended(UiList<string>, { props: { items: dangerItems, label } });
      const listbox = await mountSuspended(UiList<string>, { props: { items: dangerItems, label, modelValue: [] } });

      expect(list.get('[role="listitem"] button').classes()).toContain("text-error");
      expect(listbox.get('[role="option"]').classes()).toContain("text-error");
    });

    test("names each group of rows by its heading", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiList<string>, {
        props: {
          items: [
            { group, icon: "", title: "a", value: "a" },
            { group, icon: "", title: "b", value: "b" },
            { icon: "", title: "ba", value: "ba" },
          ],
          label,
        },
      });
      const groupList = component.get('[role="list"] [role="list"]');

      expect(groupList.attributes("aria-label")).toBe(group);
      expect(groupList.findAll("button").map((row) => row.text())).toStrictEqual(["a", "b"]);
    });

    test("leads a row with an avatar, its picture named by the title in the mark's hidden column", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiList<string>, {
        props: { items: [{ image, title, value: title }], label },
      });
      await flushPromises();
      const picture = component.get('[role="listitem"] [aria-hidden="true"] img');

      expect({ alt: picture.attributes("alt"), src: picture.attributes("src") }).toStrictEqual({
        alt: title,
        src: image,
      });
    });

    test("draws an avatar a row's mark slot passes in the same hidden column", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiList<string>, {
        props: { items: [{ image, title, value: title }], label },
        slots: {
          mark: ({ item }: { item: UiListItem<string> }) =>
            h(UiAvatar, { image: item.image, isSmall: true, name: item.title }),
        },
      });
      await flushPromises();
      const picture = component.get('[role="listitem"] [aria-hidden="true"] img');

      expect(picture.attributes("alt")).toBe(title);
    });

    test("draws a row's actions beside it rather than inside it, out of the rows' walk", async () => {
      expect.hasAssertions();

      const actionLabel = "actionLabel";
      const component = await mountSuspended(UiList<string>, {
        attachTo: document.body,
        props: { items, label },
        slots: { actions: () => h("button", { "aria-label": actionLabel, type: "button" }) },
      });
      const [listItem] = component.findAll('[role="listitem"]');
      assert.exists(listItem);
      const action = listItem.get<HTMLButtonElement>(`[aria-label="${actionLabel}"]`);
      action.element.focus();
      await action.trigger("keydown", { key: "ArrowDown" });
      await flushPromises();

      expect(action.element.parentElement).toBe(listItem.element);
      expect(document.activeElement).toBe(action.element);
    });

    test("hands each row the props its call site gives it, and draws the title its slot does", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiList<string>, {
        props: { getRowProps: ({ value }) => ({ "data-value": value }), items, label },
        slots: { title: ({ item }: { item: UiListItem<string> }) => h("strong", item.title) },
      });
      const rows = component.findAll('[role="listitem"] > :first-child');

      expect(rows.map((row) => [row.attributes("data-value"), row.get("strong").text()])).toStrictEqual(
        items.map((item) => [item.value, item.title]),
      );
    });
  });
});
