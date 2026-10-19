import type { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { WebpagePlaceableNode } from "#shared/models/pageBuilder/WebpagePlaceableNode";
import type { BlockNodeProps } from "headless-block-editor";

// The props a Section node holds: the semantic tag it renders under, the style it is drawn with, and the placeable nodes it holds
export interface SectionNodeProps extends BlockNodeProps {
  children: WebpagePlaceableNode[];
  style?: NodeStyle;
  tag: HtmlTag.Div | HtmlTag.Footer | HtmlTag.Header | HtmlTag.Main | HtmlTag.Section;
}
