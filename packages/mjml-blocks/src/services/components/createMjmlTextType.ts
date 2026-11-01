import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { MjmlTextNode } from "#src/models/MjmlTextNode";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlRichTextType } from "#src/services/components/createMjmlRichTextType";
import { createMjmlTextPropsSchema } from "#src/services/components/createMjmlTextPropsSchema";
import { textAttributes } from "#src/services/components/mjText";

// The text component: the attributes it takes, the props its schema reads and what it renders
export const createMjmlTextType = <TContent extends MjmlRichText>(
  richText: MjmlRichTextDefinition<TContent>,
): MjmlBlockTypeDefinition<MjmlTextNode> =>
  createMjmlRichTextType<MjmlTextNode, TContent>(
    {
      allowedAttributes: textAttributes,
      defaultAttributes: {
        align: "left",
        color: "#000000",
        "font-family": "Ubuntu, Helvetica, Arial, sans-serif",
        "font-size": "13px",
        "line-height": "1",
        padding: "10px 25px",
      },
      propsSchema: createMjmlTextPropsSchema(richText),
      slots: {},
      type: MjmlNodeType.Text,
    },
    richText,
  );
