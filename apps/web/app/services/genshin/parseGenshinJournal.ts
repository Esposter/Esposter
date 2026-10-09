import type { GenshinJournal } from "@/models/genshin/GenshinJournal";

import { genshinJournalSchema } from "@/models/genshin/GenshinJournal";
import { getResult } from "@esposter/shared";

// A journal the browser holds as JSON. Parsed as plain JSON, because the save holds its instants as ISO strings the
// Schema reads, so a date revival would turn them into Dates the schema rejects. A journal that does not parse is
// Logged and read as none
export const parseGenshinJournal = (journalJson: null | string): GenshinJournal | undefined => {
  if (!journalJson) return undefined;

  // oxlint-disable-next-line no-restricted-properties -- the save schema reads its instants as ISO strings itself, so there is no Date for a reviver to restore
  const parsedJson: unknown = getResult(() => JSON.parse(journalJson))
    .orTee(console.error)
    .unwrapOr(undefined);
  const result = genshinJournalSchema.safeParse(parsedJson);
  return result.success ? result.data : undefined;
};
