import type { SurveyDocument, SurveyPageNode, SurveyPlaceableNode } from "survey-engine";

import { getSurveyDocumentDatasetColumns } from "#server/services/dataset/surveyResponses/getSurveyDocumentDatasetColumns";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import {
  SurveyExpressionDisplayFormat,
  SurveyNodeType,
  SurveyTextInputType,
  surveyBooleanNodeType,
  surveyExpressionNodeType,
  surveyHtmlNodeType,
  surveyImageNodeType,
  surveyMatrixNodeType,
  surveyPageNodeType,
  surveyPanelDynamicNodeType,
  surveyPanelNodeType,
  surveyRadioGroupNodeType,
  surveyRatingNodeType,
  surveyRootPropsSchema,
  surveySliderNodeType,
  surveyTextNodeType,
} from "survey-engine";
import { describe, expect, test } from "vitest";

describe(getSurveyDocumentDatasetColumns, () => {
  const id = crypto.randomUUID();
  const name = "a";
  const createPage = (children: SurveyPlaceableNode[]): SurveyPageNode => ({
    props: { ...surveyPageNodeType.createDefaultProps(), children, id },
    type: SurveyNodeType.Page,
  });
  const createDocument = (...children: SurveyPlaceableNode[]): SurveyDocument => ({
    content: [createPage(children)],
    root: { props: surveyRootPropsSchema.parse({}) },
  });
  const cases: { label: string; node: SurveyPlaceableNode; type: ColumnType }[] = [
    {
      label: "boolean",
      node: { props: { ...surveyBooleanNodeType.createDefaultProps(), id, name }, type: SurveyNodeType.Boolean },
      type: ColumnType.Boolean,
    },
    {
      label: "rating",
      node: { props: { ...surveyRatingNodeType.createDefaultProps(), id, name }, type: SurveyNodeType.Rating },
      type: ColumnType.Number,
    },
    {
      label: "slider",
      node: { props: { ...surveySliderNodeType.createDefaultProps(), id, name }, type: SurveyNodeType.Slider },
      type: ColumnType.Number,
    },
    {
      label: "number text input",
      node: {
        props: { ...surveyTextNodeType.createDefaultProps(), id, inputType: SurveyTextInputType.Number, name },
        type: SurveyNodeType.Text,
      },
      type: ColumnType.Number,
    },
    {
      label: "date text input",
      node: {
        props: { ...surveyTextNodeType.createDefaultProps(), id, inputType: SurveyTextInputType.Date, name },
        type: SurveyNodeType.Text,
      },
      type: ColumnType.Date,
    },
    {
      label: "datetime-local text input",
      node: {
        props: { ...surveyTextNodeType.createDefaultProps(), id, inputType: SurveyTextInputType.DatetimeLocal, name },
        type: SurveyNodeType.Text,
      },
      type: ColumnType.Date,
    },
    {
      label: "text input",
      node: { props: { ...surveyTextNodeType.createDefaultProps(), id, name }, type: SurveyNodeType.Text },
      type: ColumnType.String,
    },
    {
      label: "decimal expression",
      node: {
        props: {
          ...surveyExpressionNodeType.createDefaultProps(),
          displayFormat: SurveyExpressionDisplayFormat.Decimal,
          id,
          name,
        },
        type: SurveyNodeType.Expression,
      },
      type: ColumnType.Number,
    },
    {
      label: "percent expression",
      node: {
        props: {
          ...surveyExpressionNodeType.createDefaultProps(),
          displayFormat: SurveyExpressionDisplayFormat.Percent,
          id,
          name,
        },
        type: SurveyNodeType.Expression,
      },
      type: ColumnType.Number,
    },
    {
      label: "expression shown as it is",
      node: { props: { ...surveyExpressionNodeType.createDefaultProps(), id, name }, type: SurveyNodeType.Expression },
      type: ColumnType.String,
    },
    {
      label: "radio group",
      node: { props: { ...surveyRadioGroupNodeType.createDefaultProps(), id, name }, type: SurveyNodeType.RadioGroup },
      type: ColumnType.String,
    },
    {
      label: "matrix",
      node: { props: { ...surveyMatrixNodeType.createDefaultProps(), id, name }, type: SurveyNodeType.Matrix },
      type: ColumnType.String,
    },
  ];

  // Each question kind's column type follows the rule its answer is read by, so the table pins one case per rule
  test.each(cases)("a $label question is a $type column", ({ node, type }) => {
    expect.hasAssertions();

    expect(getSurveyDocumentDatasetColumns(createDocument(node))).toStrictEqual([{ name, type }]);
  });

  test("gives a descriptive element no column", () => {
    expect.hasAssertions();

    expect(
      getSurveyDocumentDatasetColumns(
        createDocument(
          { props: { ...surveyHtmlNodeType.createDefaultProps(), id, name }, type: SurveyNodeType.Html },
          { props: { ...surveyImageNodeType.createDefaultProps(), id, name }, type: SurveyNodeType.Image },
        ),
      ),
    ).toStrictEqual([]);
  });

  // The template's number question is the answer inside each panel, not a column of the survey, so only the panel is one
  test("gives a dynamic panel one string column, whatever its template holds", () => {
    expect.hasAssertions();

    expect(
      getSurveyDocumentDatasetColumns(
        createDocument({
          props: {
            ...surveyPanelDynamicNodeType.createDefaultProps(),
            id,
            name,
            template: [
              {
                props: {
                  ...surveyTextNodeType.createDefaultProps(),
                  id,
                  inputType: SurveyTextInputType.Number,
                  name: "b",
                },
                type: SurveyNodeType.Text,
              },
            ],
          },
          type: SurveyNodeType.PanelDynamic,
        }),
      ),
    ).toStrictEqual([{ name, type: ColumnType.String }]);
  });

  // A panel's questions are read where the panel sits, and a question is titled only when its owner titled it
  test("reads the questions of its pages and panels in order, with a title only where one is set", () => {
    expect.hasAssertions();

    expect(
      getSurveyDocumentDatasetColumns(
        createDocument(
          { props: { ...surveyTextNodeType.createDefaultProps(), id, name, title: "b" }, type: SurveyNodeType.Text },
          {
            props: {
              ...surveyPanelNodeType.createDefaultProps(),
              children: [
                {
                  props: { ...surveyBooleanNodeType.createDefaultProps(), id, name: "c" },
                  type: SurveyNodeType.Boolean,
                },
              ],
              id,
            },
            type: SurveyNodeType.Panel,
          },
        ),
      ),
    ).toStrictEqual([
      { name, title: "b", type: ColumnType.String },
      { name: "c", type: ColumnType.Boolean },
    ]);
  });
});
