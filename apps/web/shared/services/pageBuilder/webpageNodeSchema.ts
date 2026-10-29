import type { ButtonNode } from "#shared/models/pageBuilder/ButtonNode";
import type { ColumnNode } from "#shared/models/pageBuilder/ColumnNode";
import type { ColumnsNode } from "#shared/models/pageBuilder/ColumnsNode";
import type { CountdownNode } from "#shared/models/pageBuilder/CountdownNode";
import type { CustomHtmlNode } from "#shared/models/pageBuilder/CustomHtmlNode";
import type { ImageNode } from "#shared/models/pageBuilder/ImageNode";
import type { SectionNode } from "#shared/models/pageBuilder/SectionNode";
import type { SurveyInviteNode } from "#shared/models/pageBuilder/SurveyInviteNode";
import type { TabNode } from "#shared/models/pageBuilder/TabNode";
import type { TabsNode } from "#shared/models/pageBuilder/TabsNode";
import type { TextNode } from "#shared/models/pageBuilder/TextNode";
import type { TooltipNode } from "#shared/models/pageBuilder/TooltipNode";
import type { TypedTextNode } from "#shared/models/pageBuilder/TypedTextNode";
import type { VideoNode } from "#shared/models/pageBuilder/VideoNode";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";
import type { WebpagePlaceableNode } from "#shared/models/pageBuilder/WebpagePlaceableNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { buttonNodeType } from "#shared/services/pageBuilder/buttonNodeType";
import { columnNodeType } from "#shared/services/pageBuilder/columnNodeType";
import { columnsNodeType } from "#shared/services/pageBuilder/columnsNodeType";
import {
  MAX_NODE_ID_LENGTH,
  MAX_WEBPAGE_NODES,
  NODE_ID_REGEX,
  WEBPAGE_PLACEABLE_NODE_TYPES,
} from "#shared/services/pageBuilder/constants";
import { countdownNodeType } from "#shared/services/pageBuilder/countdownNodeType";
import { customHtmlNodeType } from "#shared/services/pageBuilder/customHtmlNodeType";
import { imageNodeType, refineImageAlternative } from "#shared/services/pageBuilder/imageNodeType";
import { sectionNodeType } from "#shared/services/pageBuilder/sectionNodeType";
import { surveyInviteNodeType } from "#shared/services/pageBuilder/surveyInviteNodeType";
import { tabNodeType } from "#shared/services/pageBuilder/tabNodeType";
import { tabsNodeType } from "#shared/services/pageBuilder/tabsNodeType";
import { textNodeType } from "#shared/services/pageBuilder/textNodeType";
import { tooltipNodeType } from "#shared/services/pageBuilder/tooltipNodeType";
import { typedTextNodeType } from "#shared/services/pageBuilder/typedTextNodeType";
import { videoNodeType } from "#shared/services/pageBuilder/videoNodeType";
import { createAcceptedTypesError } from "headless-block-editor";
import { z } from "zod";

// A node's children are bounded by the most nodes a webpage may hold, so no slot can hold more than a document can
const boundedChildren = <TSchema extends z.ZodType>(schema: TSchema) => z.array(schema).max(MAX_WEBPAGE_NODES);

// A node's id is bounded and restricted wherever a node holds one, since the id names the node's class in the emitted CSS, which sits inside a `<style>` element
const nodeIdSchema = z.string().max(MAX_NODE_ID_LENGTH).regex(NODE_ID_REGEX);

// A placeable node's schema, reached lazily since a placeable node holds placeable nodes, so the recursion closes through the union below
const placeableNodeSchema = z.lazy((): z.ZodType<WebpagePlaceableNode> => webpagePlaceableNodeSchema);

const buttonNodeSchema = z.object({
  props: z.strictObject({ ...buttonNodeType.propsSchema.shape, id: nodeIdSchema }),
  type: z.literal(WebpageNodeType.Button),
}) satisfies z.ZodType<ButtonNode>;

const columnNodeSchema = z.object({
  props: z.strictObject({
    ...columnNodeType.propsSchema.shape,
    children: boundedChildren(placeableNodeSchema),
    id: nodeIdSchema,
  }),
  type: z.literal(WebpageNodeType.Column),
}) satisfies z.ZodType<ColumnNode>;

const columnsNodeSchema = z.object({
  props: z.strictObject({
    ...columnsNodeType.propsSchema.shape,
    children: boundedChildren(
      z.discriminatedUnion("type", [columnNodeSchema], createAcceptedTypesError([WebpageNodeType.Column])),
    ),
    id: nodeIdSchema,
  }),
  type: z.literal(WebpageNodeType.Columns),
}) satisfies z.ZodType<ColumnsNode>;

const countdownNodeSchema = z.object({
  props: z.strictObject({ ...countdownNodeType.propsSchema.shape, id: nodeIdSchema }),
  type: z.literal(WebpageNodeType.Countdown),
}) satisfies z.ZodType<CountdownNode>;

const customHtmlNodeSchema = z.object({
  props: z.strictObject({ ...customHtmlNodeType.propsSchema.shape, id: nodeIdSchema }),
  type: z.literal(WebpageNodeType.CustomHtml),
}) satisfies z.ZodType<CustomHtmlNode>;

// The alternative text rule runs once the fields pass, as the image's own schema runs it
const imageNodeSchema = z.object({
  props: z
    .strictObject({ ...imageNodeType.propsSchema.shape, id: nodeIdSchema })
    .superRefine(refineImageAlternative, { when: ({ issues }) => issues.length === 0 }),
  type: z.literal(WebpageNodeType.Image),
}) satisfies z.ZodType<ImageNode>;

const sectionNodeSchema = z.object({
  props: z.strictObject({
    ...sectionNodeType.propsSchema.shape,
    children: boundedChildren(placeableNodeSchema),
    id: nodeIdSchema,
  }),
  type: z.literal(WebpageNodeType.Section),
}) satisfies z.ZodType<SectionNode>;

const surveyInviteNodeSchema = z.object({
  props: z.strictObject({ ...surveyInviteNodeType.propsSchema.shape, id: nodeIdSchema }),
  type: z.literal(WebpageNodeType.SurveyInvite),
}) satisfies z.ZodType<SurveyInviteNode>;

const tabNodeSchema = z.object({
  props: z.strictObject({
    ...tabNodeType.propsSchema.shape,
    children: boundedChildren(placeableNodeSchema),
    id: nodeIdSchema,
  }),
  type: z.literal(WebpageNodeType.Tab),
}) satisfies z.ZodType<TabNode>;

const tabsNodeSchema = z.object({
  props: z.strictObject({
    ...tabsNodeType.propsSchema.shape,
    children: boundedChildren(
      z.discriminatedUnion("type", [tabNodeSchema], createAcceptedTypesError([WebpageNodeType.Tab])),
    ),
    id: nodeIdSchema,
  }),
  type: z.literal(WebpageNodeType.Tabs),
}) satisfies z.ZodType<TabsNode>;

const textNodeSchema = z.object({
  props: z.strictObject({ ...textNodeType.propsSchema.shape, id: nodeIdSchema }),
  type: z.literal(WebpageNodeType.Text),
}) satisfies z.ZodType<TextNode>;

const tooltipNodeSchema = z.object({
  props: z.strictObject({ ...tooltipNodeType.propsSchema.shape, id: nodeIdSchema }),
  type: z.literal(WebpageNodeType.Tooltip),
}) satisfies z.ZodType<TooltipNode>;

const typedTextNodeSchema = z.object({
  props: z.strictObject({ ...typedTextNodeType.propsSchema.shape, id: nodeIdSchema }),
  type: z.literal(WebpageNodeType.TypedText),
}) satisfies z.ZodType<TypedTextNode>;

const videoNodeSchema = z.object({
  props: z.strictObject({ ...videoNodeType.propsSchema.shape, id: nodeIdSchema }),
  type: z.literal(WebpageNodeType.Video),
}) satisfies z.ZodType<VideoNode>;

// The nodes a placeable slot accepts, each type but Column and Tab, which only Columns and Tabs hold
// One tuple feeds both the placeable union and the webpage union, so a type added here reaches both
const webpagePlaceableNodeOptions = [
  buttonNodeSchema,
  columnsNodeSchema,
  countdownNodeSchema,
  customHtmlNodeSchema,
  imageNodeSchema,
  sectionNodeSchema,
  surveyInviteNodeSchema,
  tabsNodeSchema,
  textNodeSchema,
  tooltipNodeSchema,
  typedTextNodeSchema,
  videoNodeSchema,
] satisfies readonly [z.core.$ZodTypeDiscriminable, ...z.core.$ZodTypeDiscriminable[]];

export const webpagePlaceableNodeSchema = z.discriminatedUnion(
  "type",
  webpagePlaceableNodeOptions,
  createAcceptedTypesError(WEBPAGE_PLACEABLE_NODE_TYPES),
) satisfies z.ZodType<WebpagePlaceableNode>;

// Any node a webpage holds, of whichever of its types, checked by its type tag and then by its own schema
export const webpageNodeSchema = z.discriminatedUnion(
  "type",
  [...webpagePlaceableNodeOptions, columnNodeSchema, tabNodeSchema],
  createAcceptedTypesError(WEBPAGE_PLACEABLE_NODE_TYPES),
) satisfies z.ZodType<WebpageNode>;
