import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

// A helper that reads an open document through its kind: the kind and the document come first, then its own arguments.
// The four types the kind is generic over are stated here once, so a helper names its result and arguments rather than
// Repeating the generic header that every one of them would otherwise carry
export type PageBuilderHelper<TResult, TArgs extends unknown[]> = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  document: TDocument,
  ...args: TArgs
) => TResult;
