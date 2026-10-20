import type { MjmlNode } from "#src/models/MjmlNode";
import type { MjmlNodeDefinition } from "#src/models/MjmlNodeDefinition";
import type { MjmlRootProps } from "#src/models/MjmlRootProps";
import type { BlockChildren, BlockRegistry } from "headless-block-editor";

// MJML's block types and the consumer's leaves, over the email's head and body as the root's props, with the children port the consumer composed over MJML's built-in one
export interface MjmlRegistry<TContext = unknown> extends BlockRegistry<
  MjmlNode,
  MjmlRootProps,
  MjmlNodeDefinition<MjmlNode, TContext>
> {
  children: BlockChildren<MjmlNode>;
}
