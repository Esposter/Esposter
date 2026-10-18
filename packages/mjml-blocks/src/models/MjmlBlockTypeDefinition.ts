import type { MjmlJson } from "#src/models/MjmlJson";
import type { BlockNode, BlockTypeDefinition } from "headless-block-editor";

// A registry entry for an MJML block type, with the attributes MJML takes on it and how it renders to MJML's JSON form. A
// Consumer's own leaf type renders with the consumer's context, which the document's render passes through untouched
export interface MjmlBlockTypeDefinition<TContext = undefined> extends BlockTypeDefinition {
  allowedAttributes: Record<string, string>;
  defaultAttributes: Record<string, string>;
  render: (node: BlockNode, slots: Record<string, MjmlJson[]>, context: TContext) => MjmlJson;
}
