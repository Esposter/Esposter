import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { getKitDonorCharacterIds } from "#src/services/genshinAssets/kits/record/getKitDonorCharacterIds";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The records of the donors an overlay borrows from, each built after its own donors so a borrowed value is read from
// The donor's resolved record. `chain` holds the kits being built above this one, this one last, and a donor among them
// Borrows back to a kit already being built, which fails. The caller supplies the donor's builder, because the builder
// Is the module that calls this one, so importing it here would close a cycle
export const readDonorRecordMap = (
  characterId: number,
  overlay: KitOverlay,
  buildDonorRecord: (donorId: number, chain: readonly number[]) => unknown,
  chain: readonly number[] = [characterId],
): Map<number, unknown> =>
  new Map(
    getKitDonorCharacterIds(overlay).map((donorId): [number, unknown] => {
      if (chain.includes(donorId))
        throw new InvalidOperationError(
          Operation.Read,
          String(characterId),
          `borrows from ${donorId}, which borrows back to a kit already being built`,
        );
      return [donorId, buildDonorRecord(donorId, chain)];
    }),
  );
