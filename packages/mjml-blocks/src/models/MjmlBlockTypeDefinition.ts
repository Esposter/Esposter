import type { MjmlContentKind } from "#src/models/MjmlContentKind";
import type { MjmlJson } from "#src/models/MjmlJson";
import type { BlockNode, BlockTypeDefinition, OwnProps } from "headless-block-editor";
import type { z } from "zod";

// A registry entry for an MJML block type: its attributes and defaults in MJML's grammar, and how it renders to MJML's JSON form
// Its render receives the node as the core holds it, and reads each prop it needs with getBlockPropValue and a per-field parse
export type MjmlBlockTypeDefinition<TNode extends BlockNode = BlockNode, TContext = unknown> = MjmlBlockTypeFields<
  TNode,
  TContext
> &
  MjmlContentDefinition<TNode>;

// The fields every block type definition has, whatever its content kind
type MjmlBlockTypeFields<TNode extends BlockNode, TContext> = Pick<BlockTypeDefinition<TNode>, "slots" | "type"> & {
  allowedAttributes: Record<string, string>;
  defaultAttributes: Record<string, string>;
  hasAlternativeText: boolean;
  render: (node: BlockNode, slots: Record<string, MjmlJson[]>, context: TContext) => MjmlJson;
};

// The content kind a definition declares, keyed to the props schema that holds its content: a label or raw kind holds a string, rich text holds its consumer's content, and a definition without a kind holds no content of its own
type MjmlContentDefinition<TNode extends BlockNode> =
  | { contentKind: MjmlContentKind.Label | MjmlContentKind.Raw; propsSchema: z.ZodType<MjmlStringContentProps<TNode>> }
  | { contentKind: MjmlContentKind.RichText; propsSchema: z.ZodType<OwnProps<TNode["props"]>> }
  | { contentKind?: undefined; propsSchema: z.ZodType<OwnProps<TNode["props"]>> };

// The props of a node whose content is a string: a label or raw kind's content schema parses one
type MjmlStringContentProps<TNode extends BlockNode> = OwnProps<TNode["props"]> & { content: string };
