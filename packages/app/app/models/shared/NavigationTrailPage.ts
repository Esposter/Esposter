// The pages that can sit behind another one in a breadcrumb trail. A slug rather than a path, because the
// Trail travels in the url and a path would have to be escaped into it. See /docs/platform/breadcrumb-trail
export enum NavigationTrailPage {
  All = "all",
  Resources = "resources",
}
