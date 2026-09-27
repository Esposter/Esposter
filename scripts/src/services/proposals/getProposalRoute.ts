// The route a docs link names a page by: the path under the content root without its extension, and a folder's
// `index.md` answering at the folder itself
export const getProposalRoute = (path: string): string =>
  `/${path.slice("apps/web/content/".length, -".md".length)}`.replace(/\/index$/u, "");
