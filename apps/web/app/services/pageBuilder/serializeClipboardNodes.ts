import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { PageBuilderEditor } from "@/models/pageBuilder/PageBuilderEditor";
import { getResult, SITE_NAME } from "@esposter/shared";
import { createBlockNodesSchema } from "headless-block-editor";
import { z } from "zod";

// Tags the clipboard text as page builder nodes, so text copied from anywhere else is ignored on paste
const CLIPBOARD_MARKER = `${SITE_NAME.toLowerCase()}-page-builder`;
// The clipboard's shape for a kind, whose registry and children decide which nodes a paste may hold.
// The kind's titles name every node type it holds, so they are the types a paste accepts
const getClipboardNodesSchema = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
) =>
  z.object({
    editor: z.enum(PageBuilderEditor),
    marker: z.literal(CLIPBOARD_MARKER),
    nodes: createBlockNodesSchema<TNode>(kind.nodeSchema, kind.registry, kind.children, Object.keys(kind.titles)),
  });

export const serializeClipboardNodes = ({ editor, nodes }: { editor: PageBuilderEditor; nodes: BlockNode[] }) =>
  JSON.stringify({ editor, marker: CLIPBOARD_MARKER, nodes });
// The editor and nodes clipboard text was copied as, or none when the text is not page builder nodes or is malformed
export const parseClipboardNodes = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  text: string,
) => {
  // oxlint-disable-next-line no-restricted-properties -- a node's text can look like an ISO datetime, which reviving would turn into a Date
  const clipboardValue = getResult<unknown>(() => JSON.parse(text)).unwrapOr(undefined);

  const result = getClipboardNodesSchema(kind).safeParse(clipboardValue);
  return result.success ? { editor: result.data.editor, nodes: result.data.nodes } : undefined;
};
