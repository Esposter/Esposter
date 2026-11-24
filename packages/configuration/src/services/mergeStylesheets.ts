import { compareText } from "#src/services/compareText";

export interface Stylesheet {
  id: string;
  source: string;
}

// Joins the stylesheets in module-id order, whichever order a build finished them in, so the one `style.css` holds the
// Same rules in the same order on every build of a tree
export const mergeStylesheets = (stylesheets: Stylesheet[]): string =>
  stylesheets
    .toSorted((firstStylesheet, secondStylesheet) => compareText(firstStylesheet.id, secondStylesheet.id))
    .map(({ source }) => source)
    .join("");
