import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { BlockNodeProps } from "headless-block-editor";

// The props a TypedText node holds: the texts typed out in turn, and the style it is drawn with
export interface TypedTextNodeProps extends BlockNodeProps {
  style?: NodeStyle;
  texts: string[];
}
