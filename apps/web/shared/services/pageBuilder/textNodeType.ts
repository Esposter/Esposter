import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { TextNode } from "#shared/models/pageBuilder/TextNode";
import type { TextNodeProps } from "#shared/models/pageBuilder/TextNodeProps";
import type { OwnProps } from "headless-block-editor";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { noteDocumentSchema } from "#shared/models/resource/note/NoteDocument";
import { renderNoteHtml } from "#shared/services/resource/note/renderNoteHtml";
import { z } from "zod";

const textFormSchema = z.strictObject({ content: noteDocumentSchema });
const textPropsSchema = z.object({ ...textFormSchema.shape, style: nodeStyleSchema.optional() }) satisfies z.ZodType<
  OwnProps<TextNodeProps>
>;

// Rich text written in the Note's own writing kit, so a text node holds what a note holds
export const textNodeType = {
  css: "",
  formSchema: textFormSchema,
  isFocusable: false,
  propsSchema: textPropsSchema,
  render: (node) => ({
    attributes: { [HtmlAttributeName.Class]: "text" },
    children: [{ html: renderNoteHtml(node.props.content) }],
    tag: HtmlTag.Div,
  }),
  slots: {},
  type: WebpageNodeType.Text,
} satisfies NodeTypeDefinition<TextNode>;
