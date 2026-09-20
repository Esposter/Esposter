import { SPEAKER_LABEL } from "#src/services/voiceMatch/constants";
import { readGenshinDb } from "@esposter/genshin-persona/src/services/readGenshinDb.ts";

// The stems of every clip the game data records as this character's own — their friendship lines and their combat
// Lines in the Japanese track, which is the one track this pipeline reads. A line that transcribes a scene is
// Another speaker's audio filed under the character's name and is left out
export const readReferenceVoicefiles = (name: string): string[] => {
  const genshindb = readGenshinDb();
  const voiceover = genshindb.voiceovers(name, { resultLanguage: genshindb.Language.Japanese });
  if (!voiceover) return [];

  return [...voiceover.friendLines, ...voiceover.actionLines]
    .filter(({ description }) => !description.includes(SPEAKER_LABEL))
    .map(({ voicefile }) => voicefile);
};
