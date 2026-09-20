import { checkIsMuted } from "#src/services/checkIsMuted";
import { WARM_SCRIPT_PATH } from "#src/services/constants";
import { readLanguage } from "#src/services/readLanguage";
import { spawnDetachedScript } from "#src/services/spawnDetachedScript";

// The warm request goes out only once a voice is set up and not muted, since otherwise there is nothing to wake
export const spawnWarm = (name: string): void => {
  if (!readLanguage() || checkIsMuted()) return;

  spawnDetachedScript(WARM_SCRIPT_PATH, name);
};
