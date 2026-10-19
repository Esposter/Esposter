import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { BlockNodeProps } from "headless-block-editor";

// The props a Button node holds: the link it follows, the label it shows and the style it is drawn with
export interface ButtonNodeProps extends BlockNodeProps {
  href: string;
  label: string;
  style?: NodeStyle;
}
