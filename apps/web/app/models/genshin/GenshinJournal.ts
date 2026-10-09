import type { GenshinSave } from "genshin-world/save";

import { genshinSaveSchema } from "genshin-world/save";
import { z } from "zod";

// The save a page has not yet had acknowledged, kept with the browser under the account it belongs to, with the session
// That held it. The next start adopts it only when it replaced that same session, so it is never written over a save
// Another session has since stored
export interface GenshinJournal {
  save: GenshinSave;
  sessionId: string;
}

export const genshinJournalSchema = z.object({
  save: genshinSaveSchema,
  sessionId: z.uuid(),
}) satisfies z.ZodType<GenshinJournal>;
