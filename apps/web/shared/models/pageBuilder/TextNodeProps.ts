import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { JSONContent } from "@tiptap/core";
import type { BlockNodeProps } from "headless-block-editor";

// The props a Text node holds: its rich text, written in the Note's writing kit, and the style it is drawn with
export interface TextNodeProps extends BlockNodeProps {
  content: JSONContent;
  style?: NodeStyle;
}
