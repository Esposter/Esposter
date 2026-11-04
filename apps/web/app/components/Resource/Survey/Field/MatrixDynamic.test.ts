// @vitest-environment happy-dom
import type { DOMWrapper } from "@vue/test-utils";
import type { SurveyAnswerValue, SurveyMatrixColumn, SurveyMatrixDynamicNode } from "survey-engine";

import ResourceSurveyFieldMatrixDynamic from "@/components/Resource/Survey/Field/MatrixDynamic.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { takeOne } from "@esposter/shared";
import { flushPromises, mount } from "@vue/test-utils";
import {
  MATRIX_CELL_RATING_COUNT,
  SurveyMatrixCellType,
  surveyMatrixDynamicNodePropsSchema,
  SurveyNodeType,
} from "survey-engine";
import { assert, describe, expect, test } from "vitest";

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

const getLabelText = (
  component: ReturnType<typeof mountMatrixDynamic>,
  element: Pick<DOMWrapper<Element>, "attributes">,
) => {
  const labelledBy = element.attributes("aria-labelledby");
  assert.exists(labelledBy);

  return component.get(`[id="${labelledBy}"]`).text();
};

const findButton = (component: ReturnType<typeof mountMatrixDynamic>, text: string) => {
  const button = component.findAll("button").find((item) => item.text() === text);
  assert.exists(button);

  return button;
};

describe("resourceSurveyFieldMatrixDynamic", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const columnName = "a";
    const label = "label";
    const message = "message";
    const value = "b";
    const createColumn = (cellType: SurveyMatrixCellType): SurveyMatrixColumn => ({
      cellType,
      choices: [],
      isRequired: false,
      name: columnName,
      title: columnName,
    });
    const createNode = (
      rowCount: number,
      minRowCount: number,
      maxRowCount: number,
      columns = [createColumn(SurveyMatrixCellType.Text)],
    ): SurveyMatrixDynamicNode => ({
      props: {
        ...surveyMatrixDynamicNodePropsSchema.parse({
          columns,
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

    test("draws a rating cell with one step for each step of its scale", () => {
      expect.hasAssertions();

      const component = mountMatrixDynamic(createNode(1, 0, 2, [createColumn(SurveyMatrixCellType.Rating)]));

      expect(component.findAll('[role="radio"]')).toHaveLength(MATRIX_CELL_RATING_COUNT);
    });

    test("writes the step pressed into its row as the number of that step", async () => {
      expect.hasAssertions();

      const step = 3;
      const component = mountMatrixDynamic(createNode(1, 0, 2, [createColumn(SurveyMatrixCellType.Rating)]));
      await takeOne(component.findAll('[role="radio"]'), step - 1).trigger("click");

      expect(component.emitted<[SurveyAnswerValue]>("update:modelValue")).toStrictEqual([[[{ [columnName]: step }]]]);
    });

    test("marks a required column's header, and gives its text and dropdown cells aria-required", () => {
      expect.hasAssertions();

      const component = mountMatrixDynamic(
        createNode(1, 0, 2, [
          { cellType: SurveyMatrixCellType.Text, choices: [], isRequired: true, name: "a", title: "a" },
          {
            cellType: SurveyMatrixCellType.Dropdown,
            choices: [{ text: "", value: "b" }],
            isRequired: true,
            name: "b",
            title: "b",
          },
        ]),
      );

      expect(component.findAll("th").map((header) => header.text())).toStrictEqual(["a * required", "b * required"]);
      expect(component.get("input").attributes("aria-required")).toBe("true");
      expect(component.get('[role="combobox"]').attributes("aria-required")).toBe("true");
    });

    test("names a required column's checkbox, boolean and rating cells by its header, which carries the word, and gives none aria-required", () => {
      expect.hasAssertions();

      const component = mountMatrixDynamic(
        createNode(1, 0, 2, [
          {
            cellType: SurveyMatrixCellType.Checkbox,
            choices: [{ text: "", value: "b" }],
            isRequired: true,
            name: "a",
            title: "a",
          },
          { cellType: SurveyMatrixCellType.Boolean, choices: [], isRequired: true, name: "c", title: "c" },
          { cellType: SurveyMatrixCellType.Rating, choices: [], isRequired: true, name: "d", title: "d" },
        ]),
      );
      const checkboxes = component.findAll('[role="checkbox"]');

      expect(checkboxes.map((checkbox) => checkbox.attributes("aria-required"))).toStrictEqual([undefined, undefined]);
      expect(getLabelText(component, component.get('[role="group"]'))).toBe("a * required");
      expect(getLabelText(component, takeOne(checkboxes, 1))).toBe("c * required");
      expect(getLabelText(component, component.get('[role="radiogroup"]'))).toBe("d * required");
      expect(component.get('[role="radiogroup"]').attributes("aria-required")).toBeUndefined();
    });

    test("leaves an optional column's header and cells unmarked", () => {
      expect.hasAssertions();

      const component = mountMatrixDynamic(
        createNode(1, 0, 2, [
          { cellType: SurveyMatrixCellType.Text, choices: [], isRequired: false, name: "a", title: "a" },
          {
            cellType: SurveyMatrixCellType.Dropdown,
            choices: [{ text: "", value: "b" }],
            isRequired: false,
            name: "b",
            title: "b",
          },
        ]),
      );

      expect(component.findAll("th").map((header) => header.text())).toStrictEqual(["a", "b"]);
      expect(component.get("input").attributes("aria-required")).toBeUndefined();
      expect(component.get('[role="combobox"]').attributes("aria-required")).toBeUndefined();
    });

    test("shows its error beside the table, which describes itself by it, and marks each cell invalid", () => {
      expect.hasAssertions();

      const component = mountMatrixDynamic(createNode(1, 0, 2), undefined, message);
      const alert = component.get('[role="alert"]');

      expect(alert.text()).toBe(message);
      expect(component.get("table").attributes("aria-describedby")).toBe(alert.attributes("id"));
      expect(component.get("table").attributes("aria-invalid")).toBeUndefined();
      expect(component.get("input").attributes("aria-invalid")).toBe("true");
    });
  });

  test("a disabled rating cell keeps its answer, which a press does not change", async () => {
    expect.hasAssertions();

    const component = mount(ResourceSurveyFieldMatrixDynamic, {
      props: {
        error: "",
        isDisabled: true,
        node: {
          props: {
            ...surveyMatrixDynamicNodePropsSchema.parse({
              columns: [
                {
                  cellType: SurveyMatrixCellType.Rating,
                  choices: [
                    { text: "", value: "1" },
                    { text: "", value: "2" },
                  ],
                  name: "a",
                  title: "a",
                },
              ],
              name: "b",
              rowCount: 1,
              title: "label",
            }),
            id: crypto.randomUUID(),
          },
          type: SurveyNodeType.MatrixDynamic,
        },
      },
    });
    await flushPromises();
    await component.findAll('[role="radio"]')[1]?.trigger("click");

    expect(component.emitted("update:modelValue")).toBeUndefined();
  });
});
