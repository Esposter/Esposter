import type { VoiceLine } from "#src/models/VoiceLine";

import { getPlainLineText } from "#src/services/getPlainLineText";
import { readGenshinDb } from "#src/services/readGenshinDb";
import { readWikiStoryLines } from "#src/services/readWikiStoryLines";

// Lines that carry no voice: how the character feels about others, the daily greetings, the gift and ascension
// Acknowledgements
const SKIPPED_TITLE_REGEX =
  /^(?:About |More About|Feelings About|Good (?:Morning|Afternoon|Evening|Night)|Receiving a Gift|Birthday|Ascension)/u;

export const readVoiceLines = async (name: string): Promise<VoiceLine[]> => {
  const genshindb = readGenshinDb();
  const voiceovers = genshindb.voiceovers(name);
  const friendLines = voiceovers?.friendLines ?? [];
  // A character the data has no lines for yet is usually on the wiki already
  const lines: VoiceLine[] =
    friendLines.length > 0
      ? friendLines.map(({ description, title }) => ({ text: getPlainLineText(description), title: title.trim() }))
      : await readWikiStoryLines(name);
  return lines.filter(({ title }) => !SKIPPED_TITLE_REGEX.test(title)).map(({ text, title }) => ({ text, title }));
};
