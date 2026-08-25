import { DASHBOARD_VIEW_SEPARATOR } from "@/services/dashboard/chart/constants";

// One `view` entry, split on its **first** separator only: the id ahead of it is a uuid, and everything after it
// Is the token verbatim, whatever the encoder put in it. An entry carrying no separator at all names no visual,
// So it matches nothing rather than half-matching whichever id it happens to be a prefix of
export const parseViewEntry = (entry: string): { token: string; visualId: string } => {
  const separatorIndex = entry.indexOf(DASHBOARD_VIEW_SEPARATOR);
  if (separatorIndex === -1) return { token: "", visualId: "" };

  return {
    token: entry.slice(separatorIndex + DASHBOARD_VIEW_SEPARATOR.length),
    visualId: entry.slice(0, separatorIndex),
  };
};
