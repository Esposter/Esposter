import type { HtmlNode } from "#shared/models/pageBuilder/html/HtmlNode";

export interface RenderedDomOutputSpec {
  // The children array the spec's hole stands for, where the node's own content goes
  hole?: HtmlNode[];
  node: HtmlNode;
}
