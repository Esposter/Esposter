// Sidebar weight for slugs not listed in DocsNavigationSlug — between Architecture (0) and Roadmap (1)
export const DEFAULT_DOCS_NAVIGATION_WEIGHT = 0.5;
// A list item with no value registers under its link href, which collides with its group's path value
export const DOCS_NAVIGATION_OVERVIEW_SUFFIX = "#overview";
export const MAX_DOCS_SEARCH_RESULTS = 10;
export const MAX_MERMAID_SCALE = 4;
export const MIN_MERMAID_SCALE = 0.5;
export const PLANNING_GROUP_TITLE = "Planning";
// Sized to sit inside a code block's top-right corner without covering its first line
export const PROSE_COPY_BUTTON_PROPS = {
  color: "grey-lighten-1",
  density: "comfortable",
  size: "small",
  variant: "text",
} as const;
