import type { MjmlContentKind } from "#src/models/MjmlContentKind";
import type { MjmlJson } from "#src/models/MjmlJson";
import type { BlockNode, BlockTypeDefinition } from "headless-block-editor";

// A registry entry for an MJML block type: its attributes and defaults in MJML's grammar, and how it renders to MJML's JSON form
// Its render receives the node as the core holds it, and reads each prop it needs with getBlockPropValue and a per-field parse
export interface MjmlBlockTypeDefinition<
  TNode extends BlockNode = BlockNode,
  TContext = unknown,
> extends BlockTypeDefinition<TNode> {
  allowedAttributes: Record<string, string>;
  contentKind?: MjmlContentKind;
  defaultAttributes: Record<string, string>;
  hasAlternativeText: boolean;
  render: (node: BlockNode, slots: Record<string, MjmlJson[]>, context: TContext) => MjmlJson;
}
