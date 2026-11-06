import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { TabNode } from "#shared/models/pageBuilder/TabNode";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props a Tabs node holds: the style it is drawn with and its tabs, in order
export interface TabsNodeProps extends BlockNodeProps {
  children: TabNode[];
  style?: NodeStyle;
}
