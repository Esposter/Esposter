import { DASHBOARD_VIEW_SEPARATOR } from "@/services/dashboard/chart/constants";
import { parseViewEntry } from "@/services/dashboard/chart/parseViewEntry";

// This visual's view replaces whatever the link said about it and leaves every other visual's entry alone, so a
// Reader who adjusts a second chart sends a link carrying both. An empty token is a visual with no view worth
// Carrying: it drops out rather than adding an entry that decodes to nothing
export const setViewEntryToken = (entries: string[], visualId: string, token: string): string[] => {
  const otherEntries = entries.filter((entry) => parseViewEntry(entry).visualId !== visualId);
  return token ? [...otherEntries, `${visualId}${DASHBOARD_VIEW_SEPARATOR}${token}`] : otherEntries;
};
