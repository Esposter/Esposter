// @vitest-environment happy-dom
import UiAsyncBody from "@/components/Ui/AsyncBody.vue";
import UiEmptyState from "@/components/Ui/EmptyState.vue";
import UiErrorState from "@/components/Ui/ErrorState.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiAsyncBody", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const content = "a";
    const empty = "b";
    const loading = "c";
    const emptyState = { description: "", meaning: UiIconMeaning.Tag, title: "d" };
    const slots = { default: () => h("p", content), empty: () => h("p", empty), loading: () => h("p", loading) };

    test("A pending read draws the loading slot", () => {
      expect.hasAssertions();

      const component = mount(UiAsyncBody, { props: { error: "", isPending: true }, slots });

      expect(component.text()).toBe(loading);
    });

    test("A failed read draws the error slot with a retry", async () => {
      expect.hasAssertions();

      const component = mount(UiAsyncBody, { props: { error: " " }, slots });

      expect(component.findComponent(UiErrorState).exists()).toBe(true);

      await component.get("button").trigger("click");

      expect(component.emitted("retry")).toStrictEqual([[]]);
    });

    test("A failed read draws the error slot over a pending flag", () => {
      expect.hasAssertions();

      const component = mount(UiAsyncBody, { props: { error: " ", isPending: true }, slots });

      expect(component.findComponent(UiErrorState).exists()).toBe(true);
    });

    test("An empty read draws the empty slot", () => {
      expect.hasAssertions();

      const component = mount(UiAsyncBody, { props: { emptyState, error: "", isEmpty: true }, slots });

      expect(component.text()).toBe(empty);
    });

    test("An empty read draws the empty state when no empty slot is given", () => {
      expect.hasAssertions();

      const component = mount(UiAsyncBody, {
        props: { emptyState, error: "", isEmpty: true },
        slots: { default: slots.default, loading: slots.loading },
      });

      expect(component.findComponent(UiEmptyState).props("title")).toBe(emptyState.title);
    });

    test("A read that holds rows draws its content", () => {
      expect.hasAssertions();

      const component = mount(UiAsyncBody, { props: { error: "" }, slots });

      expect(component.text()).toBe(content);
    });
  });
});
