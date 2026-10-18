import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRootProps } from "#src/models/MjmlRootProps";
import type { BlockRegistry } from "headless-block-editor";

// MJML's block types and the consumer's leaves, over the email's head and body as the root's props
export type MjmlRegistry<TContext = undefined> = BlockRegistry<MjmlBlockTypeDefinition<TContext>, MjmlRootProps>;
