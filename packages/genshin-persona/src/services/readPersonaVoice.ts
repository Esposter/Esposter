import type { SpeechVoice } from "#src/models/SpeechVoice";

import { PERSONA_VOICES_DIRECTORY } from "#src/services/constants";
import { readPersonaModule } from "#src/services/readPersonaModule";

// The benchmark's measured voice for one character, generated one module per character
export const readPersonaVoice = (name: string): Promise<SpeechVoice | undefined> =>
  readPersonaModule<SpeechVoice>(PERSONA_VOICES_DIRECTORY, name);
