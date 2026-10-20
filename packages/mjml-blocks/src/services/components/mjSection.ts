import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlSectionNode } from "#src/models/MjmlSectionNode";
import type { MjmlSectionProps } from "#src/models/MjmlSectionProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { sectionAttributes } from "#src/services/components/sectionAttributes";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

export const sectionPropsSchema: z.ZodObject<
  { [K in keyof typeof sectionAttributes.allowedAttributes]: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({
  "background-color": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["background-color"],
    "background-color",
  ).optional(),
  "background-position": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["background-position"],
    "background-position",
  ).optional(),
  "background-position-x": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["background-position-x"],
    "background-position-x",
  ).optional(),
  "background-position-y": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["background-position-y"],
    "background-position-y",
  ).optional(),
  "background-repeat": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["background-repeat"],
    "background-repeat",
  ).optional(),
  "background-size": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["background-size"],
    "background-size",
  ).optional(),
  "background-url": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["background-url"],
    "background-url",
  ).optional(),
  border: createMjmlAttributeSchema(sectionAttributes.allowedAttributes.border, "border").optional(),
  "border-bottom": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["border-bottom"],
    "border-bottom",
  ).optional(),
  "border-left": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["border-left"],
    "border-left",
  ).optional(),
  "border-radius": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["border-radius"],
    "border-radius",
  ).optional(),
  "border-right": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["border-right"],
    "border-right",
  ).optional(),
  "border-top": createMjmlAttributeSchema(sectionAttributes.allowedAttributes["border-top"], "border-top").optional(),
  direction: createMjmlAttributeSchema(sectionAttributes.allowedAttributes.direction, "direction").optional(),
  "full-width": createMjmlAttributeSchema(sectionAttributes.allowedAttributes["full-width"], "full-width").optional(),
  gutter: createMjmlAttributeSchema(sectionAttributes.allowedAttributes.gutter, "gutter").optional(),
  padding: createMjmlAttributeSchema(sectionAttributes.allowedAttributes.padding, "padding").optional(),
  "padding-bottom": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["padding-bottom"],
    "padding-bottom",
  ).optional(),
  "padding-left": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["padding-left"],
    "padding-left",
  ).optional(),
  "padding-right": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["padding-right"],
    "padding-right",
  ).optional(),
  "padding-top": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["padding-top"],
    "padding-top",
  ).optional(),
  "text-align": createMjmlAttributeSchema(sectionAttributes.allowedAttributes["text-align"], "text-align").optional(),
  "text-padding": createMjmlAttributeSchema(
    sectionAttributes.allowedAttributes["text-padding"],
    "text-padding",
  ).optional(),
}) satisfies z.ZodType<OwnProps<MjmlSectionProps>>;

// The section component: the attributes it takes, the props its schema reads and what it renders
const mjmlSectionTypeFields = {
  allowedAttributes: sectionAttributes.allowedAttributes,
  contentKind: undefined,
  defaultAttributes: sectionAttributes.defaultAttributes,
  hasAlternativeText: false,
  propsSchema: sectionPropsSchema,
  slots: { children: [MjmlNodeType.Column, MjmlNodeType.Group, MjmlNodeType.Raw] },
  type: MjmlNodeType.Section,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlSectionNode>>;

export const mjmlSectionType: MjmlBlockTypeDefinition<MjmlSectionNode> = {
  ...mjmlSectionTypeFields,
  render: renderMjmlNode({ ...mjmlSectionTypeFields, hasChildren: true, tagName: MjmlNodeType.Section }),
};
