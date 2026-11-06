// @vitest-environment happy-dom
import type { SurveyDropdownNode } from "vue-survey-engine-headless";

import SurveyFieldDropdown from "@/components/Resource/Survey/Field/Dropdown.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { assert, describe, expect, test } from "vitest";
import { surveyDropdownNodePropsSchema, SurveyNodeType } from "vue-survey-engine-headless";

describe("resourceSurveyFieldDropdown", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const choices = [
      { text: "a", value: "a" },
      { text: "b", value: "b" },
      { text: "c", value: "c" },
    ];
    const description = "a";
    const error = "message";
    const title = "Favourite colour";
    const seed = crypto.randomUUID();
    const createNode = (): SurveyDropdownNode => ({
      props: { ...surveyDropdownNodePropsSchema.parse({ choices, name: "a", title }), id: crypto.randomUUID() },
      type: SurveyNodeType.Dropdown,
    });

    test("is a select named by the question's title", () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldDropdown, {
        props: { error: "", isDisabled: false, node: createNode(), seed },
      });

      expect(component.get('[role="combobox"]').attributes("aria-label")).toBe(title);
    });

    test("shows its placeholder while nothing is picked", () => {
      expect.hasAssertions();

      const placeholder = "Pick a colour";
      const component = mount(SurveyFieldDropdown, {
        props: {
          error: "",
          isDisabled: false,
          node: {
            props: {
              ...surveyDropdownNodePropsSchema.parse({ choices, name: "a", placeholder, title }),
              id: crypto.randomUUID(),
            },
            type: SurveyNodeType.Dropdown,
          },
          seed,
        },
      });

      expect(component.get('[role="combobox"]').text()).toBe(placeholder);
    });

    test("answers with the choice the keyboard picks from its open list", async () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldDropdown, {
        attachTo: document.body,
        props: { error: "", isDisabled: false, node: createNode(), seed },
      });
      const activator = component.get('[role="combobox"]');
      await activator.trigger("keydown", { key: "ArrowDown" });
      await flushPromises();
      await activator.trigger("keydown", { key: "End" });
      await activator.trigger("keydown", { key: "Enter" });
      await flushPromises();

      expect(component.emitted("update:modelValue")).toStrictEqual([["c"]]);
    });

    test("shows its error beside it", () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldDropdown, { props: { error, isDisabled: false, node: createNode(), seed } });

      expect(component.get('[role="alert"]').text()).toBe(error);
    });

    test("is described by the question's description, then its error", () => {
      expect.hasAssertions();

      const component = mount(SurveyFieldDropdown, {
        props: {
          error,
          isDisabled: false,
          node: {
            props: {
              ...surveyDropdownNodePropsSchema.parse({ choices, description, name: "a", title }),
              id: crypto.randomUUID(),
            },
            type: SurveyNodeType.Dropdown,
          },
          seed,
        },
      });
      const describedBy = component.get('[role="combobox"]').attributes("aria-describedby");
      assert.exists(describedBy);

      expect(describedBy.split(" ").map((id) => component.get(`[id="${id}"]`).text())).toStrictEqual([
        description,
        error,
      ]);
    });
  });
});
