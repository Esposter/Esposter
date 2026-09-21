import type { PersonaCard } from "#src/models/PersonaCard";
import type { SpeechRequest } from "#src/models/SpeechRequest";
import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { WARM_TEXT } from "#src/services/constants";
import { getSpeechRequest } from "#src/services/getSpeechRequest";

// What a warm synthesizes: one short word, so the graph's first-call cost is paid before the first reply. Nothing
// Is kept: every spoken line is written for its ask, so no clip made ahead would be asked for again
export const getWarmRequest = (
  name: string,
  personaCard: PersonaCard | undefined,
  language: VoiceLanguage,
): SpeechRequest => getSpeechRequest(VoiceRequestType.Warm, name, personaCard, language, [WARM_TEXT]);
