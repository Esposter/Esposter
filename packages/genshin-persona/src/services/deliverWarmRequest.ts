import type { PersonaCard } from "#src/models/PersonaCard";

import { checkIsSilent } from "#src/services/checkIsSilent";
import { deliverVoiceRequest } from "#src/services/deliverVoiceRequest";
import { getWarmRequest } from "#src/services/getWarmRequest";
import { readVoiceLanguage } from "#src/services/readVoiceLanguage";

// The warm request goes out only once a voice is set up and something would be heard from it, since otherwise
// There is nothing to wake: a session that will never be spoken to pays a gigabyte and a half of weights and the
// GPU memory holding them, for the half hour it takes the resident synthesizer to idle back out
export const deliverWarmRequest = async (name: string, personaCard: PersonaCard | undefined): Promise<void> => {
  const language = readVoiceLanguage();
  if (!language || checkIsSilent()) return;

  await deliverVoiceRequest(getWarmRequest(name, personaCard, language));
};
