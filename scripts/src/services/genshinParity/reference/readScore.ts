import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";

import { compareScreen } from "#src/services/genshinParity/reference/compareScreen";
import { getResultAsync } from "@esposter/shared";

export const readScore = async (referenceId: string): Promise<ParityScore | undefined> =>
  (await getResultAsync(() => compareScreen(referenceId))).match(
    ({ score }) => score,
    (error) => {
      console.log(`failed: ${error.message}`);
      return undefined;
    },
  );
