import type { TabsNodeProps } from "#shared/models/pageBuilder/TabsNodeProps";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockNode } from "headless-block-editor";

// A Tabs node of a webpage: a set of tabs, each with its panel
export type TabsNode = BlockNode<WebpageNodeType.Tabs, TabsNodeProps>;
