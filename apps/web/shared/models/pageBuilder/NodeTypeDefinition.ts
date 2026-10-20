import type { HtmlNode } from "#shared/models/pageBuilder/HtmlNode";
import type { NodeSlots } from "#shared/models/pageBuilder/NodeSlots";
import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { BlockNode, BlockTypeDefinition } from "headless-block-editor";
import type { z } from "zod";

// The shared half of a webpage node type, typed by the node it defines: what the server renders when it publishes and what the editor edits
export interface NodeTypeDefinition<TNode extends BlockNode = BlockNode> extends BlockTypeDefinition<TNode> {
  // Structural CSS emitted once per document holding the type, or empty when it has none
  css: string;
  // The editable content props, which the editor draws as a form
  formSchema: z.ZodType;
  // Whether a reader can focus the node with the keyboard, so its hover style also shows on focus
  isFocusable: boolean;
  // Pure: the node and its rendered slots in, one element out, folded by the core's renderBlockNodes
  render: (node: TNode, slots: NodeSlots<TNode>, context: RenderContext) => HtmlNode;
  // A self-contained runtime emitted once per published page holding the type
  script?: () => void;
}
