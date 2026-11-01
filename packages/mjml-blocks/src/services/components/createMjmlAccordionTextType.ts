import type { MjmlAccordionTextNode } from "#src/models/MjmlAccordionTextNode";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAccordionTextPropsSchema } from "#src/services/components/createMjmlAccordionTextPropsSchema";
import { createMjmlRichTextType } from "#src/services/components/createMjmlRichTextType";
import { accordionTextAttributes } from "#src/services/components/mjAccordionText";

// The accordion text component: the attributes it takes, the props its schema reads and what it renders
export const createMjmlAccordionTextType = <TContent extends MjmlRichText>(
  richText: MjmlRichTextDefinition<TContent>,
): MjmlBlockTypeDefinition<MjmlAccordionTextNode> =>
  createMjmlRichTextType<MjmlAccordionTextNode, TContent>(
    {
      allowedAttributes: accordionTextAttributes,
      defaultAttributes: { "font-size": "13px", "line-height": "1", padding: "16px" },
      propsSchema: createMjmlAccordionTextPropsSchema(richText),
      slots: {},
      type: MjmlNodeType.AccordionText,
    },
    richText,
  );
