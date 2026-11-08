import type { StaleRow } from "#src/models/gameVersion/StaleRow";
import type { StampedOutput } from "#src/models/gameVersion/StampedOutput";

import { NO_GAME_VERSION } from "#src/services/gameVersion/constants";
import { checkIsVouchedBy } from "#src/services/provenance/checkIsVouchedBy";
import { getOrCreate } from "@esposter/shared";

// One row per command that wrote a stale output: the stale outputs it wrote, and the game version each names
export const groupStaleOutputs = (outputs: readonly StampedOutput[], gameVersion: string): StaleRow[] => {
  const outputsByCommand = new Map<string, StampedOutput[]>();
  for (const output of outputs.filter(({ provenance }) => !checkIsVouchedBy(provenance, gameVersion)))
    getOrCreate(outputsByCommand, output.command, () => []).push(output);
  return [...outputsByCommand]
    .toSorted(([left], [right]) => (left < right ? -1 : 1))
    .map(([command, staleOutputs]) => ({
      command,
      gameVersions: [
        ...new Set(staleOutputs.map(({ provenance }) => (provenance ? provenance.gameVersion : NO_GAME_VERSION))),
      ].toSorted(),
      outputCount: staleOutputs.length,
    }));
};
