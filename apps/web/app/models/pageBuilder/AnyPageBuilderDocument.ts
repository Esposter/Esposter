import type { BlockDocument, BlockNode, BlockRootProps } from "headless-block-editor";

// The document the shell holds of any kind, which the kind's own document type narrows
export type AnyPageBuilderDocument = BlockDocument<BlockNode, BlockRootProps>;
