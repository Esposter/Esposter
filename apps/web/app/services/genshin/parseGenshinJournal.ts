import type { GenshinJournal } from "@/models/genshin/GenshinJournal";

import { genshinJournalSchema } from "@/models/genshin/GenshinJournal";
import { parseJsonWithSchema } from "@/services/shared/parseJsonWithSchema";

// A journal the browser holds as JSON, read as none when it is absent, does not parse or holds a save the schema refuses
export const parseGenshinJournal = (journalJson: null | string): GenshinJournal | undefined =>
  journalJson ? parseJsonWithSchema(journalJson, genshinJournalSchema) : undefined;
