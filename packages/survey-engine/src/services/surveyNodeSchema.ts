import type { SurveyBooleanNode } from "#src/models/SurveyBooleanNode";
import type { SurveyButtonGroupNode } from "#src/models/SurveyButtonGroupNode";
import type { SurveyCheckboxNode } from "#src/models/SurveyCheckboxNode";
import type { SurveyCommentNode } from "#src/models/SurveyCommentNode";
import type { SurveyDropdownNode } from "#src/models/SurveyDropdownNode";
import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyHtmlNode } from "#src/models/SurveyHtmlNode";
import type { SurveyImageNode } from "#src/models/SurveyImageNode";
import type { SurveyImagePickerNode } from "#src/models/SurveyImagePickerNode";
import type { SurveyMatrixDynamicNode } from "#src/models/SurveyMatrixDynamicNode";
import type { SurveyMatrixNode } from "#src/models/SurveyMatrixNode";
import type { SurveyMultipleTextNode } from "#src/models/SurveyMultipleTextNode";
import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyPageNode } from "#src/models/SurveyPageNode";
import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";
import type { SurveyPanelNode } from "#src/models/SurveyPanelNode";
import type { SurveyPlaceableNode } from "#src/models/SurveyPlaceableNode";
import type { SurveyRadioGroupNode } from "#src/models/SurveyRadioGroupNode";
import type { SurveyRankingNode } from "#src/models/SurveyRankingNode";
import type { SurveyRatingNode } from "#src/models/SurveyRatingNode";
import type { SurveySliderNode } from "#src/models/SurveySliderNode";
import type { SurveyTagBoxNode } from "#src/models/SurveyTagBoxNode";
import type { SurveyTemplateNode } from "#src/models/SurveyTemplateNode";
import type { SurveyTextNode } from "#src/models/SurveyTextNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { boundedChildren } from "#src/services/boundedChildren";
import { surveyBooleanNodeType } from "#src/services/surveyBooleanNodeType";
import { surveyButtonGroupNodeType } from "#src/services/surveyButtonGroupNodeType";
import { surveyCheckboxNodeType } from "#src/services/surveyCheckboxNodeType";
import { surveyCommentNodeType } from "#src/services/surveyCommentNodeType";
import { surveyDropdownNodeType } from "#src/services/surveyDropdownNodeType";
import { surveyExpressionNodeType } from "#src/services/surveyExpressionNodeType";
import { surveyHtmlNodeType } from "#src/services/surveyHtmlNodeType";
import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { surveyImageNodeType } from "#src/services/surveyImageNodeType";
import { surveyImagePickerNodeType } from "#src/services/surveyImagePickerNodeType";
import { surveyMatrixDynamicNodeType } from "#src/services/surveyMatrixDynamicNodeType";
import { surveyMatrixNodeType } from "#src/services/surveyMatrixNodeType";
import { surveyMultipleTextNodeType } from "#src/services/surveyMultipleTextNodeType";
import {
  SURVEY_PLACEABLE_NODE_TYPES,
  SURVEY_ROOT_NODE_TYPES,
  SURVEY_TEMPLATE_NODE_TYPES,
} from "#src/services/surveyNodeTypeLists";
import { surveyPageNodeType } from "#src/services/surveyPageNodeType";
import { surveyPanelDynamicNodeType } from "#src/services/surveyPanelDynamicNodeType";
import { surveyPanelNodeType } from "#src/services/surveyPanelNodeType";
import { surveyRadioGroupNodeType } from "#src/services/surveyRadioGroupNodeType";
import { surveyRankingNodeType } from "#src/services/surveyRankingNodeType";
import { surveyRatingNodeType } from "#src/services/surveyRatingNodeType";
import { surveySliderNodeType } from "#src/services/surveySliderNodeType";
import { surveyTagBoxNodeType } from "#src/services/surveyTagBoxNodeType";
import { surveyTextNodeType } from "#src/services/surveyTextNodeType";
import { createAcceptedTypesError } from "headless-block-editor";
import { z } from "zod";

// A panel holds placeable nodes and a dynamic panel's template holds template nodes, so each is reached lazily and the
// Recursion closes through the unions below
const placeableNodeSchema = z.lazy((): z.ZodType<SurveyPlaceableNode> => surveyPlaceableNodeSchema);
const templateNodeSchema = z.lazy((): z.ZodType<SurveyTemplateNode> => surveyTemplateNodeSchema);

const surveyBooleanNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyBooleanNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.Boolean),
}) satisfies z.ZodType<SurveyBooleanNode>;

const surveyButtonGroupNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyButtonGroupNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.ButtonGroup),
}) satisfies z.ZodType<SurveyButtonGroupNode>;

const surveyCheckboxNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyCheckboxNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.Checkbox),
}) satisfies z.ZodType<SurveyCheckboxNode>;

const surveyCommentNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyCommentNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.Comment),
}) satisfies z.ZodType<SurveyCommentNode>;

const surveyDropdownNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyDropdownNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.Dropdown),
}) satisfies z.ZodType<SurveyDropdownNode>;

const surveyExpressionNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyExpressionNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.Expression),
}) satisfies z.ZodType<SurveyExpressionNode>;

const surveyHtmlNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyHtmlNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.Html),
}) satisfies z.ZodType<SurveyHtmlNode>;

const surveyImageNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyImageNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.Image),
}) satisfies z.ZodType<SurveyImageNode>;

const surveyImagePickerNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyImagePickerNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.ImagePicker),
}) satisfies z.ZodType<SurveyImagePickerNode>;

const surveyMatrixNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyMatrixNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.Matrix),
}) satisfies z.ZodType<SurveyMatrixNode>;

const surveyMatrixDynamicNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyMatrixDynamicNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.MatrixDynamic),
}) satisfies z.ZodType<SurveyMatrixDynamicNode>;

const surveyMultipleTextNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyMultipleTextNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.MultipleText),
}) satisfies z.ZodType<SurveyMultipleTextNode>;

const surveyPageNodeSchemaValue = z.object({
  props: z.strictObject({
    ...surveyPageNodeType.propsSchema.shape,
    children: boundedChildren(placeableNodeSchema),
    id: surveyIdSchema,
  }),
  type: z.literal(SurveyNodeType.Page),
}) satisfies z.ZodType<SurveyPageNode>;

const surveyPanelNodeSchemaValue = z.object({
  props: z.strictObject({
    ...surveyPanelNodeType.propsSchema.shape,
    children: boundedChildren(placeableNodeSchema),
    id: surveyIdSchema,
  }),
  type: z.literal(SurveyNodeType.Panel),
}) satisfies z.ZodType<SurveyPanelNode>;

const surveyPanelDynamicNodeSchemaValue = z.object({
  props: z.strictObject({
    ...surveyPanelDynamicNodeType.propsSchema.shape,
    id: surveyIdSchema,
    template: boundedChildren(templateNodeSchema),
  }),
  type: z.literal(SurveyNodeType.PanelDynamic),
}) satisfies z.ZodType<SurveyPanelDynamicNode>;

const surveyRadioGroupNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyRadioGroupNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.RadioGroup),
}) satisfies z.ZodType<SurveyRadioGroupNode>;

const surveyRankingNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyRankingNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.Ranking),
}) satisfies z.ZodType<SurveyRankingNode>;

const surveyRatingNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyRatingNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.Rating),
}) satisfies z.ZodType<SurveyRatingNode>;

const surveySliderNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveySliderNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.Slider),
}) satisfies z.ZodType<SurveySliderNode>;

const surveyTagBoxNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyTagBoxNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.TagBox),
}) satisfies z.ZodType<SurveyTagBoxNode>;

const surveyTextNodeSchemaValue = z.object({
  props: z.strictObject({ ...surveyTextNodeType.propsSchema.shape, id: surveyIdSchema }),
  type: z.literal(SurveyNodeType.Text),
}) satisfies z.ZodType<SurveyTextNode>;

// The questions a dynamic panel's template accepts: every question but a dynamic panel
// One tuple feeds the template, placeable and survey unions, so a question added here reaches all three
const surveyTemplateNodeOptions = [
  surveyTextNodeSchemaValue,
  surveyCommentNodeSchemaValue,
  surveyBooleanNodeSchemaValue,
  surveyRadioGroupNodeSchemaValue,
  surveyDropdownNodeSchemaValue,
  surveyCheckboxNodeSchemaValue,
  surveyTagBoxNodeSchemaValue,
  surveyRatingNodeSchemaValue,
  surveyRankingNodeSchemaValue,
  surveyMatrixNodeSchemaValue,
  surveyMatrixDynamicNodeSchemaValue,
  surveyMultipleTextNodeSchemaValue,
  surveySliderNodeSchemaValue,
  surveyButtonGroupNodeSchemaValue,
  surveyImagePickerNodeSchemaValue,
  surveyExpressionNodeSchemaValue,
  surveyHtmlNodeSchemaValue,
  surveyImageNodeSchemaValue,
] satisfies readonly [z.core.$ZodTypeDiscriminable, ...z.core.$ZodTypeDiscriminable[]];

const surveyTemplateNodeSchema: z.ZodType<SurveyTemplateNode> = z.discriminatedUnion(
  "type",
  surveyTemplateNodeOptions,
  createAcceptedTypesError(SURVEY_TEMPLATE_NODE_TYPES),
) satisfies z.ZodType<SurveyTemplateNode>;

// Every question and a panel, the nodes a page or a panel accepts
const surveyPlaceableNodeOptions = [
  ...surveyTemplateNodeOptions,
  surveyPanelDynamicNodeSchemaValue,
  surveyPanelNodeSchemaValue,
] satisfies readonly [z.core.$ZodTypeDiscriminable, ...z.core.$ZodTypeDiscriminable[]];

// The nodes a page or a panel accepts: every question and a panel
export const surveyPlaceableNodeSchema: z.ZodType<SurveyPlaceableNode> = z.discriminatedUnion(
  "type",
  surveyPlaceableNodeOptions,
  createAcceptedTypesError(SURVEY_PLACEABLE_NODE_TYPES),
) satisfies z.ZodType<SurveyPlaceableNode>;

// A page, the only node the root accepts
export const surveyPageNodeSchema: z.ZodType<SurveyPageNode> = surveyPageNodeSchemaValue;

// Any node a survey holds, checked by its type tag and then by its own schema
export const surveyNodeSchema: z.ZodType<SurveyNode> = z.discriminatedUnion(
  "type",
  [...surveyPlaceableNodeOptions, surveyPageNodeSchemaValue],
  createAcceptedTypesError([...SURVEY_ROOT_NODE_TYPES, ...SURVEY_PLACEABLE_NODE_TYPES]),
) satisfies z.ZodType<SurveyNode>;
