import type { SurveyCalculatedValue } from "#src/models/SurveyCalculatedValue";
import type { SurveyCheckboxNode } from "#src/models/SurveyCheckboxNode";
import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyHtmlNode } from "#src/models/SurveyHtmlNode";
import type { SurveyMatrixDynamicNode } from "#src/models/SurveyMatrixDynamicNode";
import type { SurveyPageNode } from "#src/models/SurveyPageNode";
import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";
import type { SurveyPanelNode } from "#src/models/SurveyPanelNode";
import type { SurveyPlaceableNode } from "#src/models/SurveyPlaceableNode";
import type { SurveyRadioGroupNode } from "#src/models/SurveyRadioGroupNode";
import type { SurveyTemplateNode } from "#src/models/SurveyTemplateNode";
import type { SurveyTextNode } from "#src/models/SurveyTextNode";
import type { SurveyTextNodeProps } from "#src/models/SurveyTextNodeProps";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { surveyRootPropsSchema } from "#src/models/SurveyRootProps";
import { checkSurveyDocument } from "#src/services/checkSurveyDocument";
import { SURVEY_NONE_ANSWER } from "#src/services/runner/constants";
import { surveyCheckboxNodeType } from "#src/services/surveyCheckboxNodeType";
import { surveyExpressionNodeType } from "#src/services/surveyExpressionNodeType";
import { surveyHtmlNodeType } from "#src/services/surveyHtmlNodeType";
import { surveyMatrixDynamicNodeType } from "#src/services/surveyMatrixDynamicNodeType";
import { surveyPageNodeType } from "#src/services/surveyPageNodeType";
import { surveyPanelDynamicNodeType } from "#src/services/surveyPanelDynamicNodeType";
import { surveyPanelNodeType } from "#src/services/surveyPanelNodeType";
import { surveyRadioGroupNodeType } from "#src/services/surveyRadioGroupNodeType";
import { surveyTextNodeType } from "#src/services/surveyTextNodeType";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// Each builder starts from its kind's own defaults, so a case writes only the fields it reads
const createText = (name: string, overrides: Partial<SurveyTextNodeProps> = {}): SurveyTextNode => ({
  props: { ...surveyTextNodeType.createDefaultProps(), id: v7(), name, ...overrides },
  type: SurveyNodeType.Text,
});

const createHtml = (name: string): SurveyHtmlNode => ({
  props: { ...surveyHtmlNodeType.createDefaultProps(), id: v7(), name },
  type: SurveyNodeType.Html,
});

const createExpression = (name: string, expression: string): SurveyExpressionNode => ({
  props: { ...surveyExpressionNodeType.createDefaultProps(), expression, id: v7(), name },
  type: SurveyNodeType.Expression,
});

const createPanel = (children: SurveyPlaceableNode[]): SurveyPanelNode => ({
  props: { ...surveyPanelNodeType.createDefaultProps(), children, id: v7() },
  type: SurveyNodeType.Panel,
});

const createDynamicPanel = (name: string, template: SurveyTemplateNode[]): SurveyPanelDynamicNode => ({
  props: { ...surveyPanelDynamicNodeType.createDefaultProps(), id: v7(), name, template },
  type: SurveyNodeType.PanelDynamic,
});

const createPage = (children: SurveyPlaceableNode[], visibleIf = ""): SurveyPageNode => ({
  props: { ...surveyPageNodeType.createDefaultProps(), children, id: v7(), visibleIf },
  type: SurveyNodeType.Page,
});

const createDocument = (content: SurveyPageNode[], calculatedValues: SurveyCalculatedValue[] = []): SurveyDocument => ({
  content,
  root: { props: { ...surveyRootPropsSchema.parse({}), calculatedValues } },
});

describe(checkSurveyDocument, () => {
  test("a radio group offering none refuses a choice taking the none answer's value, at its choices", () => {
    expect.hasAssertions();

    const radioGroup: SurveyRadioGroupNode = {
      props: {
        ...surveyRadioGroupNodeType.createDefaultProps(),
        choices: [{ text: "Nothing", value: SURVEY_NONE_ANSWER }],
        hasNone: true,
        id: v7(),
        name: "a",
      },
      type: SurveyNodeType.RadioGroup,
    };

    expect(checkSurveyDocument(createDocument([createPage([radioGroup])]))).toStrictEqual([
      {
        message: `A choice may not take the value "${SURVEY_NONE_ANSWER}", since the question offers none under it`,
        pointer: "/content/0/props/children/0/props/choices",
      },
    ]);
  });

  test("a checkbox offering no none may give a choice the none answer's value, since no none answer is taken", () => {
    expect.hasAssertions();

    const checkbox: SurveyCheckboxNode = {
      props: {
        ...surveyCheckboxNodeType.createDefaultProps(),
        choices: [{ text: "None of the above", value: SURVEY_NONE_ANSWER }],
        id: v7(),
        name: "a",
      },
      type: SurveyNodeType.Checkbox,
    };

    expect(checkSurveyDocument(createDocument([createPage([checkbox])]))).toStrictEqual([]);
  });

  test("a checkbox whose minimum selection is above its maximum is refused, at its minimum", () => {
    expect.hasAssertions();

    const checkbox: SurveyCheckboxNode = {
      props: { ...surveyCheckboxNodeType.createDefaultProps(), id: v7(), maxSelected: 1, minSelected: 3, name: "a" },
      type: SurveyNodeType.Checkbox,
    };

    expect(checkSurveyDocument(createDocument([createPage([checkbox])]))).toStrictEqual([
      {
        message: "The minimum 3 is above the maximum 1, so no answer could meet both",
        pointer: "/content/0/props/children/0/props/minSelected",
      },
    ]);
  });

  test("a dynamic matrix whose minimum row count is above its maximum is refused, at its minimum", () => {
    expect.hasAssertions();

    const matrix: SurveyMatrixDynamicNode = {
      props: {
        ...surveyMatrixDynamicNodeType.createDefaultProps(),
        id: v7(),
        maxRowCount: 3,
        minRowCount: 5,
        name: "a",
      },
      type: SurveyNodeType.MatrixDynamic,
    };

    expect(checkSurveyDocument(createDocument([createPage([matrix])]))).toStrictEqual([
      {
        message: "The minimum 5 is above the maximum 3, so no answer could meet both",
        pointer: "/content/0/props/children/0/props/minRowCount",
      },
    ]);
  });

  test("two questions sharing a name are refused, naming the second", () => {
    expect.hasAssertions();

    const document = createDocument([createPage([createText("a"), createText("a")])]);

    expect(checkSurveyDocument(document)).toStrictEqual([
      {
        message: 'The name "a" is already used by an earlier question',
        pointer: "/content/0/props/children/1/props/name",
      },
    ]);
  });

  test("a question in a panel repeating a page question's name is refused, naming the panel's question", () => {
    expect.hasAssertions();

    const document = createDocument([createPage([createText("a"), createPanel([createText("a")])])]);

    expect(checkSurveyDocument(document)).toStrictEqual([
      {
        message: 'The name "a" is already used by an earlier question',
        pointer: "/content/0/props/children/1/props/children/0/props/name",
      },
    ]);
  });

  test("a template question reusing a name outside its dynamic panel is saved", () => {
    expect.hasAssertions();

    const document = createDocument([createPage([createText("a"), createDynamicPanel("b", [createText("a")])])]);

    expect(checkSurveyDocument(document)).toStrictEqual([]);
  });

  test("two template questions sharing a name are refused, naming the second template question", () => {
    expect.hasAssertions();

    const document = createDocument([createPage([createDynamicPanel("b", [createText("a"), createText("a")])])]);

    expect(checkSurveyDocument(document)).toStrictEqual([
      {
        message: 'The name "a" is already used by an earlier question',
        pointer: "/content/0/props/children/0/props/template/1/props/name",
      },
    ]);
  });

  test("a malformed visibility condition is refused at the question's visibleIf, naming the condition", () => {
    expect.hasAssertions();

    const document = createDocument([createPage([createText("a", { visibleIf: "{a} >" })])]);

    expect(checkSurveyDocument(document)).toStrictEqual([
      {
        message: expect.stringMatching(/^The visibility condition does not parse: /u),
        pointer: "/content/0/props/children/0/props/visibleIf",
      },
    ]);
  });

  test("a calculated value named like a question is refused, at its name", () => {
    expect.hasAssertions();

    const document = createDocument(
      [createPage([createText("a")])],
      [{ expression: "{a}", includeIntoResult: false, name: "a" }],
    );

    expect(checkSurveyDocument(document)).toStrictEqual([
      {
        message: 'The name "a" is already used by a question or an earlier calculated value',
        pointer: "/root/props/calculatedValues/0/name",
      },
    ]);
  });

  test("two calculated values sharing a name are refused, naming the second", () => {
    expect.hasAssertions();

    const document = createDocument(
      [createPage([])],
      [
        { expression: "{a}", includeIntoResult: false, name: "b" },
        { expression: "{a}", includeIntoResult: false, name: "b" },
      ],
    );

    expect(checkSurveyDocument(document)).toStrictEqual([
      {
        message: 'The name "b" is already used by a question or an earlier calculated value',
        pointer: "/root/props/calculatedValues/1/name",
      },
    ]);
  });

  test("a calculated value may share a name with a question inside a dynamic panel's template", () => {
    expect.hasAssertions();

    const document = createDocument(
      [createPage([createDynamicPanel("b", [createText("a")])])],
      [{ expression: "{a}", includeIntoResult: false, name: "a" }],
    );

    expect(checkSurveyDocument(document)).toStrictEqual([]);
  });

  test("a block of text sharing a question's name is saved, since it holds no answer", () => {
    expect.hasAssertions();

    const document = createDocument([createPage([createHtml("a"), createText("a")])]);

    expect(checkSurveyDocument(document)).toStrictEqual([]);
  });

  test("a condition naming no question is saved, since a forward reference is a legitimate target", () => {
    expect.hasAssertions();

    const document = createDocument([createPage([createText("a", { visibleIf: "{nothing}" })])]);

    expect(checkSurveyDocument(document)).toStrictEqual([]);
  });

  test("every refusal is returned in document order, not only the first", () => {
    expect.hasAssertions();

    const document = createDocument(
      [
        createPage(
          [
            createText("a", { validators: [{ expression: "{a} >", text: "a" }] }),
            createText("a"),
            createExpression("c", "{a} >"),
          ],
          "{a} >",
        ),
      ],
      [{ expression: "{a} >", includeIntoResult: false, name: "d" }],
    );

    expect(checkSurveyDocument(document)).toStrictEqual([
      {
        message: expect.stringMatching(/^The visibility condition does not parse: /u),
        pointer: "/content/0/props/visibleIf",
      },
      {
        message: expect.stringMatching(/^The validator expression does not parse: /u),
        pointer: "/content/0/props/children/0/props/validators/0/expression",
      },
      {
        message: 'The name "a" is already used by an earlier question',
        pointer: "/content/0/props/children/1/props/name",
      },
      {
        message: expect.stringMatching(/^The expression does not parse: /u),
        pointer: "/content/0/props/children/2/props/expression",
      },
      {
        message: expect.stringMatching(/^The calculated value expression does not parse: /u),
        pointer: "/root/props/calculatedValues/0/expression",
      },
    ]);
  });
});
