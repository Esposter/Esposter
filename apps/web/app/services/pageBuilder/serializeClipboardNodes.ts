import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { webpageNodeSchema } from "#shared/services/pageBuilder/webpageNodeSchema";
import { PageBuilderEditor } from "@/models/pageBuilder/PageBuilderEditor";
import { SITE_NAME } from "@esposter/shared";
import { createBlockNodesSchema } from "headless-block-editor";
import { z } from "zod";

// Tags the clipboard text as page builder nodes, so text copied from anywhere else is ignored on paste
const CLIPBOARD_MARKER = `${SITE_NAME.toLowerCase()}-page-builder`;
const clipboardNodesSchema = z.object({
  editor: z.enum(PageBuilderEditor),
  marker: z.literal(CLIPBOARD_MARKER),
  nodes: createBlockNodesSchema<WebpageNode>(webpageNodeSchema, webpageNodeChildren, Object.values(WebpageNodeType)),
});

export const serializeClipboardNodes = ({ editor, nodes }: { editor: PageBuilderEditor; nodes: WebpageNode[] }) =>
  JSON.stringify({ editor, marker: CLIPBOARD_MARKER, nodes });

// The editor and nodes clipboard text was copied as, or none when the text is not page builder nodes or is malformed
export const parseClipboardNodes = (text: string) => {
  let clipboardValue: unknown;
  try {
    // oxlint-disable-next-line no-restricted-properties -- a node's text can look like an ISO datetime, which reviving would turn into a Date
    clipboardValue = JSON.parse(text);
  } catch {
    return undefined;
  }

  const result = clipboardNodesSchema.safeParse(clipboardValue);
  return result.success ? { editor: result.data.editor, nodes: result.data.nodes } : undefined;
};
