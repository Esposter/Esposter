import { readGameVersion } from "#src/services/genshinAssets/shared/readGameVersion";
import { getResultAsync } from "@esposter/shared";

// The installed game's version when this machine has an install that names one, else undefined.
// An install never read is left out of the manifest header rather than guessed
export const readKnownGameVersion = (): Promise<string | undefined> =>
  getResultAsync(() => readGameVersion()).match(
    (version) => version,
    // An install never read is left out, as the header above says
    () => undefined,
  );
