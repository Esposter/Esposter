// The pages that can sit behind another one in a breadcrumb trail. A slug rather than a path or a title,
// Because a trail is recorded onto a history entry and read back off entries written by earlier releases: an
// Identifier that names the page and nothing else lets NavigationTrailPageMap re-route it or rename its crumb
// Without invalidating the trails already out there. See /docs/platform/breadcrumb-trail
export enum NavigationTrailPage {
  All = "all",
  Resources = "resources",
}
