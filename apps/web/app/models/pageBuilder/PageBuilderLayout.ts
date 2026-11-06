import type { Layout } from "vue-editor-layout-headless";

// A page builder editor's arrangement: the layout the shell draws, and the name each panel of a tabbed region shows as its tab
export interface PageBuilderLayout {
  layout: Layout;
  panelTitleMap: Record<string, string>;
}
