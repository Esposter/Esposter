import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props a Video node holds: where it loads from, its title as its accessible name, and the style it is drawn with
export interface VideoNodeProps extends BlockNodeProps {
  src: string;
  style?: NodeStyle;
  title: string;
}
