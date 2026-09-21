import type { SpeechRequest } from "#src/models/SpeechRequest";
import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { readCharacterReference } from "#src/services/readCharacterReference";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readVolume } from "#src/services/readVolume";

// What a hook sends to be spoken or warmed: the character the session speaks as, with the reference the card or
// The generated map names for them, the dub the `voice` verb chose, and the volume as set
export const getSpeechRequest = async (
  type: SpeechRequest["type"],
  name: string,
  language: VoiceLanguage,
  text: string,
): Promise<SpeechRequest> => {
  const personaCard = await readPersonaCard(name);
  return { language, name, stem: readCharacterReference(name, personaCard), text, type, volume: readVolume() };
};
