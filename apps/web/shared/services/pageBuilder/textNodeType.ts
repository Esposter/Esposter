import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { noteDocumentSchema } from "#shared/models/resource/note/NoteDocument";
import { renderNoteHtml } from "#shared/services/resource/note/renderNoteHtml";
import { z } from "zod";

const textFormSchema = z.strictObject({ content: noteDocumentSchema });
const textPropsSchema = z.strictObject({ ...textFormSchema.shape, id: z.string() });

// Rich text written in the Note's own writing kit, so a text node holds what a note holds
export const textNodeType = {
  css: "",
  formSchema: textFormSchema,
  propsSchema: textPropsSchema,
  render: (node) => {
    const { content } = textPropsSchema.parse(node.props);
    return {
      attributes: { [HtmlAttributeName.Class]: "text" },
      children: [{ html: renderNoteHtml(content) }],
      tag: HtmlTag.Div,
    };
  },
  slots: {},
  type: WebpageNodeType.Text,
} satisfies NodeTypeDefinition;
