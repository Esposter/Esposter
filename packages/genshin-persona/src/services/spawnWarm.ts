import type { PersonaCard } from "#src/models/PersonaCard";

import { checkIsSilent } from "#src/services/checkIsSilent";
import { SEND_SCRIPT_PATH } from "#src/services/constants";
import { getWarmRequest } from "#src/services/getWarmRequest";
import { readVoiceLanguage } from "#src/services/readVoiceLanguage";
import { spawnDetachedScript } from "#src/services/spawnDetachedScript";

// The warm request goes out only once a voice is set up and something would be heard from it, since otherwise
// There is nothing to wake: a session that will never be spoken to pays a gigabyte and a half of weights and the
// GPU memory holding them, for the half hour it takes the resident synthesizer to idle back out. Detached, since
// The session-start hook's stdout is the model's context and it waits on nothing
export const spawnWarm = (name: string, personaCard: PersonaCard | undefined): void => {
  const language = readVoiceLanguage();
  if (!language || checkIsSilent()) return;

  spawnDetachedScript(SEND_SCRIPT_PATH, JSON.stringify(getWarmRequest(name, personaCard, language)));
};
