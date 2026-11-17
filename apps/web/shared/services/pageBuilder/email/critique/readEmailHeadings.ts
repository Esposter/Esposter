import type { EmailHeading } from "#shared/models/pageBuilder/EmailHeading";
import type { MjmlNode, MjmlRichText } from "mjml-blocks";

import { EMAIL_HEADING_NODE_TYPE } from "#shared/services/pageBuilder/email/critique/constants";
import { emailNodeChildren } from "#shared/services/pageBuilder/email/emailNodeChildren";
import { MjmlNodeType } from "mjml-blocks";
import { getBlockSlots } from "vue-block-editor-headless";

// Whether a rich text node or any node under it holds some text
const checkHasRichTextContent = (richText: MjmlRichText): boolean =>
  Boolean(richText.text) || (richText.content ?? []).some((child) => checkHasRichTextContent(child));

// The headings a text's rich text holds, in document order, each named by the text block that holds it
const readRichTextHeadings = (nodeId: string, richText: MjmlRichText): EmailHeading[] => {
  const level = richText.attrs?.level;
  const heading =
    richText.type === EMAIL_HEADING_NODE_TYPE
      ? [{ isEmpty: !checkHasRichTextContent(richText), level: typeof level === "number" ? level : 1, nodeId }]
      : [];
  return [...heading, ...(richText.content ?? []).flatMap((child) => readRichTextHeadings(nodeId, child))];
};

// The headings of an email's nodes in document order: each text block's, then the blocks nested under it
export const readEmailHeadings = (nodes: readonly MjmlNode[]): EmailHeading[] =>
  nodes.flatMap((node) => [
    ...(node.type === MjmlNodeType.Text ? readRichTextHeadings(node.props.id, node.props.content) : []),
    ...Object.values(getBlockSlots(emailNodeChildren, node)).flatMap((slotNodes) => readEmailHeadings(slotNodes)),
  ]);
