import { SHOTS_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

// Where the last shot of a screen is written: our side of a comparison, which a probe reads back
export const getShotPath = (screen: string): string => join(SHOTS_DIRECTORY, `${screen}.png`);
