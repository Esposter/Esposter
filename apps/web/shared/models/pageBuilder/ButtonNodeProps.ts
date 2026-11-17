import type { ButtonTarget } from "#shared/models/pageBuilder/ButtonTarget";
import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props a Button node holds: the link it follows, the label it shows and the style it is drawn with
export interface ButtonNodeProps extends BlockNodeProps {
  elementId: string;
  href: string;
  label: string;
  style?: NodeStyle | undefined;
  target: ButtonTarget;
}
