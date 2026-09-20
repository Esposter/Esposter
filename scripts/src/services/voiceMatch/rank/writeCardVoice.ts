import type { VoiceFit } from "#src/models/voiceMatch/VoiceFit";

import { getVoiceText } from "#src/services/voiceMatch/rank/getVoiceText";
import { replaceCardVoice } from "#src/services/voiceMatch/rank/replaceCardVoice";
import { PERSONA_CARD_EXTENSION, PERSONA_CARDS_DIRECTORY } from "@esposter/genshin-persona/src/services/constants.ts";
import { getPersonaCardName } from "@esposter/genshin-persona/src/services/getPersonaCardName.ts";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Stage 6: the fitted voice written into the character's card in place of the object it carried. False for a
// Character with no card, whose voice has nowhere to go yet
export const writeCardVoice = (name: string, fit: VoiceFit): boolean => {
  const cardPath = join(PERSONA_CARDS_DIRECTORY, `${getPersonaCardName(name)}${PERSONA_CARD_EXTENSION}`);
  if (!existsSync(cardPath)) return false;

  const card = readFileSync(cardPath, "utf8");
  const voiceText = getVoiceText(fit);
  writeFileSync(cardPath, replaceCardVoice(card, cardPath, voiceText));
  return true;
};
