import type { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import type { HtmlNode } from "#shared/models/pageBuilder/HtmlNode";
import type { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";

// An element a render writes: its tag, its attributes by typed name and its children in order
export interface HtmlElement {
  attributes: Partial<Record<HtmlAttributeName, string>>;
  children: HtmlNode[];
  tag: HtmlTag;
}
