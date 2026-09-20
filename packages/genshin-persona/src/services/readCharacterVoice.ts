import type { PersonaCard } from "#src/models/PersonaCard";
import type { SpeechVoice } from "#src/models/SpeechVoice";

import { readPersonaVoice } from "#src/services/readPersonaVoice";

// The voice that reads one character: the ear's, written in the card, over the benchmark's, generated beside it —
// And nothing for a character neither has reached, whose reply the configured voice reads
export const readCharacterVoice = async (
  name: string,
  personaCard: PersonaCard | undefined,
): Promise<SpeechVoice | undefined> => personaCard?.voice ?? (await readPersonaVoice(name));
