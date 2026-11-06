import type { TabNodeProps } from "#shared/models/pageBuilder/TabNodeProps";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockNode } from "vue-block-editor-headless";

// A Tab node of a webpage: the panel of one tab of a Tabs node
export type TabNode = BlockNode<WebpageNodeType.Tab, TabNodeProps>;
