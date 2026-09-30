import type { Character } from "#src/models/Character";
import type { LocalizationStrings } from "#src/models/LocalizationStrings";

// What every verb reads before it acts, once a run: the interface language and its roster and words, the day, and
// The session the tool started the verb in
export interface GenshinContext {
  language: string;
  // A choice a verb offers is a list in the interface language's own punctuation, which the runtime knows
  listFormat: Intl.ListFormat;
  roster: Character[];
  // Empty from a shell, where the tool set nothing
  sessionId: string;
  strings: LocalizationStrings;
  today: Temporal.PlainDate;
}
