import type { RouteLocationRaw } from "vue-router";

// One place in a row of links drawn as tabs: a page's sections, each somewhere to go rather than a panel to show
export interface UiTabLink {
  // An icon class written whole, drawn before the title
  icon?: string;
  // The link for where the reader is, which may not be where it goes: a section's tab stays current on every page in it
  isCurrent: boolean;
  title: string;
  to: RouteLocationRaw;
}
