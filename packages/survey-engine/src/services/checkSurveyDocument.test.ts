import type { SurveyCalculatedValue } from "#src/models/SurveyCalculatedValue";
import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyHtmlNode } from "#src/models/SurveyHtmlNode";
import type { SurveyPageNode } from "#src/models/SurveyPageNode";
import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";
import type { SurveyPanelNode } from "#src/models/SurveyPanelNode";
import type { SurveyPlaceableNode } from "#src/models/SurveyPlaceableNode";
import type { SurveyTemplateNode } from "#src/models/SurveyTemplateNode";
import type { SurveyTextNode } from "#src/models/SurveyTextNode";
import type { SurveyTextNodeProps } from "#src/models/SurveyTextNodeProps";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { surveyRootPropsSchema } from "#src/models/SurveyRootProps";
import { checkSurveyDocument } from "#src/services/checkSurveyDocument";
import { surveyExpressionNodeType } from "#src/services/surveyExpressionNodeType";
import { surveyHtmlNodeType } from "#src/services/surveyHtmlNodeType";
import { surveyPageNodeType } from "#src/services/surveyPageNodeType";
import { surveyPanelDynamicNodeType } from "#src/services/surveyPanelDynamicNodeType";
import { surveyPanelNodeType } from "#src/services/surveyPanelNodeType";
import { surveyTextNodeType } from "#src/services/surveyTextNodeType";
import { describe, expect, test } from "vitest";

// Each builder starts from its kind's own defaults, so a case writes only the fields it reads
const createText = (name: string, overrides: Partial<SurveyTextNodeProps> = {}): SurveyTextNode => ({
  props: { ...surveyTextNodeType.createDefaultProps(), id: crypto.randomUUID(), name, ...overrides },
  type: SurveyNodeType.Text,
});

const createHtml = (name: string): SurveyHtmlNode => ({
  props: { ...surveyHtmlNodeType.createDefaultProps(), id: crypto.randomUUID(), name },
  type: SurveyNodeType.Html,
});

const createExpression = (name: string, expression: string): SurveyExpressionNode => ({
  props: { ...surveyExpressionNodeType.createDefaultProps(), expression, id: crypto.randomUUID(), name },
  type: SurveyNodeType.Expression,
});

const createPanel = (children: SurveyPlaceableNode[]): SurveyPanelNode => ({
  props: { ...surveyPanelNodeType.createDefaultProps(), children, id: crypto.randomUUID() },
  type: SurveyNodeType.Panel,
});

const createDynamicPanel = (name: string, template: SurveyTemplateNode[]): SurveyPanelDynamicNode => ({
  props: { ...surveyPanelDynamicNodeType.createDefaultProps(), id: crypto.randomUUID(), name, template },
  type: SurveyNodeType.PanelDynamic,
});

const createPage = (children: SurveyPlaceableNode[], visibleIf = ""): SurveyPageNode => ({
  props: { ...surveyPageNodeType.createDefaultProps(), children, id: crypto.randomUUID(), visibleIf },
  type: SurveyNodeType.Page,
});

const createDocument = (content: SurveyPageNode[], calculatedValues: SurveyCalculatedValue[] = []): SurveyDocument => ({
  content,
  root: { props: { ...surveyRootPropsSchema.parse({}), calculatedValues } },
});

describe(checkSurveyDocument, () => {
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
