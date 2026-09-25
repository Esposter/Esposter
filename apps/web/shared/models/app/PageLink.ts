import type { PageMark } from "#shared/models/app/PageMark";

// A page of the app as the dock shows it: where it is, what it is called, and the mark it was last visited with
export interface PageLink {
  mark?: PageMark;
  path: string;
  title: string;
}
