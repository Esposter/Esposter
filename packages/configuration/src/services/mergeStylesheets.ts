export interface Stylesheet {
  id: string;
  source: string;
}

// By code unit rather than `localeCompare`, which orders by the machine's locale and so moves the bytes between machines
const byId = (a: Stylesheet, b: Stylesheet): number => {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
};

// Joins the stylesheets in module-id order, whichever order a build finished them in, so the one `style.css` holds the
// Same rules in the same order on every build of a tree
export const mergeStylesheets = (stylesheets: Stylesheet[]): string =>
  stylesheets
    .toSorted(byId)
    .map(({ source }) => source)
    .join("");
