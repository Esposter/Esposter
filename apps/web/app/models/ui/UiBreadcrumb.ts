import type { RouteLocationRaw } from "vue-router";

// One page on a trail back: what it reads as and where it goes. The page the reader is on is never one
export interface UiBreadcrumb {
  title: string;
  to: RouteLocationRaw;
}
