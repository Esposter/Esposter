import { SPEAKER_LABEL_REGEX } from "#src/services/voiceMatch/constants";
import { readGenshinDb } from "@esposter/genshin-persona/src/services/readGenshinDb.ts";

// The stems of every clip the game data records as this character's own — their friendship lines and their combat
// Lines. A stem is the same in every language's data, so one reading serves every track; a line that transcribes a
// Scene is another speaker's audio filed under the character's name and is left out
export const readReferenceVoicefiles = (name: string): string[] => {
  const voiceover = readGenshinDb().voiceovers(name);
  if (!voiceover) return [];

  return [...voiceover.friendLines, ...voiceover.actionLines]
    .filter(({ description }) => !SPEAKER_LABEL_REGEX.test(description))
    .map(({ voicefile }) => voicefile);
};
