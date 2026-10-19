import type { ButtonNodeProps } from "#shared/models/pageBuilder/ButtonNodeProps";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockNode } from "headless-block-editor";

// A Button node of a webpage: a link drawn as a button
export type ButtonNode = BlockNode<WebpageNodeType.Button, ButtonNodeProps>;
