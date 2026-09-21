import type { PersonaCard } from "#src/models/PersonaCard";
import type { SpeechRequest } from "#src/models/SpeechRequest";
import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { readCharacterReference } from "#src/services/readCharacterReference";
import { readVolume } from "#src/services/readVolume";

// What a hook sends to be spoken or warmed: the character the session speaks as, with the reference the card or
// The generated map names for them, the dub the `voice` verb chose, the lines, the turn and the volume as set
export const getSpeechRequest = (
  type: SpeechRequest["type"],
  name: string,
  personaCard: PersonaCard | undefined,
  language: VoiceLanguage,
  lines: string[],
  turnId = "",
): SpeechRequest => ({
  language,
  lines,
  name,
  stem: readCharacterReference(name, personaCard),
  turnId,
  type,
  volume: readVolume(),
});
