// @vitest-environment happy-dom
import type { SurveyAnswerValue, SurveyMatrixDynamicNode } from "survey-engine";

import ResourceSurveyFieldMatrixDynamic from "@/components/Resource/Survey/Field/MatrixDynamic.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { SurveyMatrixCellType, surveyMatrixDynamicNodePropsSchema, SurveyNodeType } from "survey-engine";
import { assert, describe, expect, test } from "vitest";

describe("resourceSurveyFieldMatrixDynamic", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const columnName = "a";
    const label = "label";
    const message = "message";
    const value = "b";
    const createNode = (rowCount: number, minRowCount: number, maxRowCount: number): SurveyMatrixDynamicNode => ({
      props: {
        ...surveyMatrixDynamicNodePropsSchema.parse({
          columns: [{ cellType: SurveyMatrixCellType.Text, name: columnName, title: columnName }],
          maxRowCount,
          minRowCount,
          name: "b",
          rowCount,
          title: label,
        }),
        id: crypto.randomUUID(),
      },
      type: SurveyNodeType.MatrixDynamic,
    });
    const mountMatrixDynamic = (node: SurveyMatrixDynamicNode, modelValue?: SurveyAnswerValue, error = "") => {
      const component = mount(ResourceSurveyFieldMatrixDynamic, {
        props: {
          error,
          isDisabled: false,
          modelValue,
          node,
          "onUpdate:modelValue": (answer?: SurveyAnswerValue) => component.setProps({ modelValue: answer }),
        },
      });
      return component;
    };
    const findButton = (component: ReturnType<typeof mountMatrixDynamic>, text: string) => {
      const button = component.findAll("button").find((item) => item.text() === text);
      assert.exists(button);

      return button;
    };

    test("is a table captioned by its title, with one row of cells per answer row", () => {
      expect.hasAssertions();

      const component = mountMatrixDynamic(createNode(1, 0, 2));

      expect(component.get("caption").text()).toBe(label);
      expect(component.findAll("tbody tr")).toHaveLength(1);
    });

    test("adds and removes rows only within its bounds", async () => {
      expect.hasAssertions();

      const component = mountMatrixDynamic(createNode(1, 1, 2));

      expect(component.get('[aria-label="Remove row"]').attributes("disabled")).toBe("");
      expect(findButton(component, "Add row").attributes("disabled")).toBeUndefined();

      await findButton(component, "Add row").trigger("click");
      await flushPromises();

      expect(component.props("modelValue")).toStrictEqual([{}, {}]);
      expect(component.get('[aria-label="Remove row"]').attributes("disabled")).toBeUndefined();
      expect(findButton(component, "Add row").attributes("disabled")).toBe("");
    });

    test("writes a text cell's answer into the record of its row", async () => {
      expect.hasAssertions();

      const component = mountMatrixDynamic(createNode(1, 0, 2));
      await component.get("input").setValue(value);

      expect(component.emitted<[SurveyAnswerValue]>("update:modelValue")).toStrictEqual([[[{ [columnName]: value }]]]);
    });

    test("shows its error beside the table and marks the table invalid", () => {
      expect.hasAssertions();

      const component = mountMatrixDynamic(createNode(1, 0, 2), undefined, message);

      expect(component.get('[role="alert"]').text()).toBe(message);
      expect(component.get("table").attributes("aria-invalid")).toBe("true");
    });
  });
});
