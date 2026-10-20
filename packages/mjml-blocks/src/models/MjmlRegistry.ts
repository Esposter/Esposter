import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlNode } from "#src/models/MjmlNode";
import type { MjmlRootProps } from "#src/models/MjmlRootProps";
import type { BlockChildren, BlockRegistry } from "headless-block-editor";

// MJML's block types and the consumer's leaves, over the email's head and body as the root's props, with the children port the consumer composed over MJML's built-in one
export interface MjmlRegistry<TContext = unknown> extends BlockRegistry<
  MjmlNode,
  MjmlRootProps,
  MjmlBlockTypeDefinition<MjmlNode, TContext>
> {
  children: BlockChildren<MjmlNode>;
}
