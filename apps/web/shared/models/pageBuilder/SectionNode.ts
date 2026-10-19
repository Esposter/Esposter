import type { SectionNodeProps } from "#shared/models/pageBuilder/SectionNodeProps";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockNode } from "headless-block-editor";

// A Section node of a webpage: a block of the page under a semantic tag
export type SectionNode = BlockNode<WebpageNodeType.Section, SectionNodeProps>;
