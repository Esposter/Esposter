import type { SurveyCheckboxNode } from "#src/models/SurveyCheckboxNode";
import type { SurveyTextNode } from "#src/models/SurveyTextNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { convertSurveyNodeKind } from "#src/services/convertSurveyNodeKind";
import { surveyCheckboxNodeType } from "#src/services/surveyCheckboxNodeType";
import { surveyDropdownNodeType } from "#src/services/surveyDropdownNodeType";
import { surveyTextNodeType } from "#src/services/surveyTextNodeType";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(convertSurveyNodeKind, () => {
  const id = v7();
  const choices = [
    { text: "Pear", value: 1 },
    { text: "Fig", value: 2 },
  ];

  test("a choice question keeps its choices and its texts in another choice kind", () => {
    expect.hasAssertions();

    const checkbox: SurveyCheckboxNode = {
      props: { ...surveyCheckboxNodeType.createDefaultProps(), choices, id, title: "Fruit" },
      type: SurveyNodeType.Checkbox,
    };

    expect(convertSurveyNodeKind(checkbox, SurveyNodeType.Dropdown)).toStrictEqual({
      isContentDropped: false,
      node: {
        props: { ...surveyDropdownNodeType.createDefaultProps(), choices, id, title: "Fruit" },
        type: SurveyNodeType.Dropdown,
      },
    });
  });

  test("a prop the new kind has no place for, set away from its default, marks the change as dropping content", () => {
    expect.hasAssertions();

    const checkbox: SurveyCheckboxNode = {
      props: { ...surveyCheckboxNodeType.createDefaultProps(), choices, id, maxSelected: 1 },
      type: SurveyNodeType.Checkbox,
    };

    expect(convertSurveyNodeKind(checkbox, SurveyNodeType.Dropdown)?.isContentDropped).toBe(true);
  });

  test("a kind the converted props do not make a valid node of is refused", () => {
    expect.hasAssertions();

    const text: SurveyTextNode = {
      props: { ...surveyTextNodeType.createDefaultProps(), id },
      type: SurveyNodeType.Text,
    };

    expect(convertSurveyNodeKind(text, SurveyNodeType.PanelDynamic)).toBeUndefined();
  });
});
