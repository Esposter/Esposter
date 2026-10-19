import type { TextNodeProps } from "#shared/models/pageBuilder/TextNodeProps";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockNode } from "headless-block-editor";

// A Text node of a webpage: rich text
export type TextNode = BlockNode<WebpageNodeType.Text, TextNodeProps>;
