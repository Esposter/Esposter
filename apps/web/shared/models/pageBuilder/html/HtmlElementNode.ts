import type { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import type { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import type { HtmlNode } from "#shared/models/pageBuilder/html/HtmlNode";
import type { HtmlNodeType } from "#shared/models/pageBuilder/html/HtmlNodeType";

export interface HtmlElementNode {
  // A typed set holding no event handler, so no render can emit one
  attributes: Partial<Record<ElementAttribute, string>>;
  children: HtmlNode[];
  tag: ElementTag;
  type: HtmlNodeType.Element;
}
