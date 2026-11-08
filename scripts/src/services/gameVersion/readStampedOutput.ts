import type { StampedOutput } from "#src/models/gameVersion/StampedOutput";

import { readStamp } from "#src/services/provenance/readStamp";
import { getResultAsync } from "@esposter/shared";

// The output a stamp belongs to, read from it. A stamp no reader can parse names itself by path as its command, so it is
// Listed as stale rather than halting the scan
export const readStampedOutput = async (stampPath: string): Promise<StampedOutput> => {
  const provenance = await getResultAsync(() => readStamp(stampPath)).match(
    (stamp) => stamp,
    () => undefined,
  );
  return { command: provenance ? provenance.command : `unreadable stamp at ${stampPath}`, provenance };
};
