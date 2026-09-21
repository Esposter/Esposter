import { checkIsSilent } from "#src/services/checkIsSilent";
import { WARM_SCRIPT_PATH } from "#src/services/constants";
import { readVoiceLanguage } from "#src/services/readVoiceLanguage";
import { spawnDetachedScript } from "#src/services/spawnDetachedScript";

// The warm request goes out only once a voice is set up and something would be heard from it, since otherwise
// There is nothing to wake: a session that will never be spoken to pays a gigabyte and a half of weights and the
// GPU memory holding them, for the half hour it takes the resident synthesizer to idle back out
export const spawnWarm = (name: string): void => {
  if (!readVoiceLanguage() || checkIsSilent()) return;

  spawnDetachedScript(WARM_SCRIPT_PATH, name);
};
