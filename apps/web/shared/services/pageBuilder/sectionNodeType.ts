import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { SectionTag } from "#shared/models/pageBuilder/SectionTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WEBPAGE_PLACEABLE_NODE_TYPES } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

const sectionFormSchema = z.strictObject({ tag: z.enum(SectionTag) });
const sectionPropsSchema = z.strictObject({
  ...sectionFormSchema.shape,
  children: z.array(z.unknown()),
  id: z.string(),
});

// A block of the page under a semantic tag, holding any placeable content
export const sectionNodeType = {
  css: "",
  formSchema: sectionFormSchema,
  propsSchema: sectionPropsSchema,
  render: (node, slots) => ({
    attributes: { class: "section" },
    children: slots.children ?? [],
    tag: sectionPropsSchema.parse(node.props).tag,
  }),
  slots: { children: WEBPAGE_PLACEABLE_NODE_TYPES },
  type: WebpageNodeType.Section,
} satisfies NodeTypeDefinition;
