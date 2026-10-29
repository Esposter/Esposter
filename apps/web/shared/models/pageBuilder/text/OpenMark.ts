import type { HtmlNode } from "#shared/models/pageBuilder/html/HtmlNode";
import type { Mark } from "@tiptap/pm/model";

// A mark whose element is still open while a text run is rendered, and the children array its content goes into
export interface OpenMark {
  hole: HtmlNode[];
  mark: Mark;
}
