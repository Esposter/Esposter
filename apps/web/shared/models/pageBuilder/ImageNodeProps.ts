import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { BlockNodeProps } from "headless-block-editor";

// The props an Image node holds: where it loads from, the text a reader without it gets, and whether it is only decoration
export interface ImageNodeProps extends BlockNodeProps {
  alt: string;
  decorative: boolean;
  src: string;
  style?: NodeStyle;
}
