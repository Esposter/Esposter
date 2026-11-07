import type { Provenance } from "#src/models/provenance/Provenance";

import { checkIsVouchedBy } from "#src/services/provenance/checkIsVouchedBy";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The stamp of an input a consumer may read, refused when it is missing or names another game version than the install's
export const assertVouched = (provenance: Provenance | undefined, name: string, gameVersion: string): Provenance => {
  if (provenance === undefined)
    throw new InvalidOperationError(Operation.Read, name, "has no provenance stamp, so its game version is unknown");
  if (!checkIsVouchedBy(provenance, gameVersion))
    throw new InvalidOperationError(
      Operation.Read,
      name,
      `is stamped with game ${provenance.gameVersion}, not the install's ${gameVersion}`,
    );
  return provenance;
};
