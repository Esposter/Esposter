import type { VoiceLine } from "#src/models/VoiceLine";

import { getPlainLineText } from "#src/services/getPlainLineText";
import { readGenshinDb } from "#src/services/readGenshinDb";
import { readWikiStoryLines } from "#src/services/readWikiStoryLines";

// Every line the character speaks, as a person reads it; `checkIsOwnVoiceLine` is the authoring command's cut
export const readVoiceLines = async (name: string): Promise<VoiceLine[]> => {
  const genshindb = readGenshinDb();
  const voiceovers = genshindb.voiceovers(name);
  const friendLines = voiceovers?.friendLines ?? [];
  // A character the data has no lines for yet is usually on the wiki already
  const lines: VoiceLine[] =
    friendLines.length > 0
      ? friendLines.map(({ description, title }) => ({ text: getPlainLineText(description), title: title.trim() }))
      : await readWikiStoryLines(name);
  return lines.map(({ text, title }) => ({ text, title }));
};
