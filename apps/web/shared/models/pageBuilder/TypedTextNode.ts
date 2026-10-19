import type { TypedTextNodeProps } from "#shared/models/pageBuilder/TypedTextNodeProps";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockNode } from "headless-block-editor";

// A TypedText node of a webpage: text that types itself out
export type TypedTextNode = BlockNode<WebpageNodeType.TypedText, TypedTextNodeProps>;
