import type { MjmlAccordionTextNode } from "#src/models/MjmlAccordionTextNode";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { MjmlRichTextTypeOptions } from "#src/models/MjmlRichTextTypeOptions";
import type { MjmlTextNode } from "#src/models/MjmlTextNode";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { renderMjmlNode } from "#src/services/renderMjmlNode";

// A rich-text component's type: its attributes, defaults, props schema and slots, and a render of its content through the consumer's rich text
export const createMjmlRichTextType = <
  TNode extends MjmlAccordionTextNode | MjmlTextNode,
  TContent extends MjmlRichText,
>(
  { allowedAttributes, defaultAttributes, propsSchema, slots, type }: MjmlRichTextTypeOptions<TNode>,
  richText: MjmlRichTextDefinition<TContent>,
): MjmlBlockTypeDefinition<TNode> => ({
  allowedAttributes,
  contentKind: MjmlContentKind.RichText,
  defaultAttributes,
  hasAlternativeText: false,
  propsSchema,
  render: renderMjmlNode(
    {
      allowedAttributes,
      contentKind: MjmlContentKind.RichText,
      hasAlternativeText: false,
      hasChildren: false,
      tagName: type,
    },
    richText,
  ),
  slots,
  type,
});
