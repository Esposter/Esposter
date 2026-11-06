import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props a CustomHtml node holds: the raw HTML its author wrote and the style it is drawn with
export interface CustomHtmlNodeProps extends BlockNodeProps {
  html: string;
  style?: NodeStyle;
}
