import type { PersonaCard } from "#src/models/PersonaCard";
import type { SpeechRequest } from "#src/models/SpeechRequest";
import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { WARM_TEXT } from "#src/services/constants";
import { getSpeechRequest } from "#src/services/getSpeechRequest";

// What a warm synthesizes: a carded character's greeting, which the output style opens the first reply with, so
// The synthesizer keeps that clip and the first reply's opening line plays without a synthesis; one short word
// For a character with no card, so the graph's first-call cost is still paid before the first reply
export const getWarmRequest = (
  name: string,
  personaCard: PersonaCard | undefined,
  language: VoiceLanguage,
): SpeechRequest =>
  getSpeechRequest(VoiceRequestType.Warm, name, personaCard, language, [personaCard?.greeting ?? WARM_TEXT]);
