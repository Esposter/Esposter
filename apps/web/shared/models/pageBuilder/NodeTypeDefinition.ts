import type { HtmlElementNode } from "#shared/models/pageBuilder/html/HtmlElementNode";
import type { HtmlNode } from "#shared/models/pageBuilder/html/HtmlNode";
import type { NodeSlot } from "#shared/models/pageBuilder/NodeSlot";
import type { PageNode } from "#shared/models/pageBuilder/PageNode";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";
import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { SlotKey } from "#shared/models/pageBuilder/SlotKey";
import type { Except } from "type-fest";
import type { z } from "zod";

// The half of a node type the server reads as well as the editor: what the type is and what it emits
export interface NodeTypeDefinition<TNode extends PageNode, TType extends TNode["type"], TProps extends PageNodeProps> {
  // A fresh node's props, its children minted with ids of their own; the node's own id is the caller's
  createProps: () => Except<TProps, "id">;
  // Takes the editor's node schema, so a slot validates its children without the type importing the union it is in
  createPropsSchema: (nodeSchema: z.ZodType<TNode>) => z.ZodType<TProps>;
  // Structural CSS emitted once per document holding the type, ahead of every node's own rules
  css?: string;
  // Pure: props and rendered slots in, an element tree out — HTML for a webpage type, MJML for an email type
  render: (props: TProps, slots: Record<SlotKey<TProps, TNode>, HtmlNode[]>, context: RenderContext) => HtmlElementNode;
  // A self-contained script emitted once per published page holding the type, finding its own elements
  script?: string;
  slots: Record<SlotKey<TProps, TNode>, NodeSlot<TNode["type"]>>;
  type: TType;
}
