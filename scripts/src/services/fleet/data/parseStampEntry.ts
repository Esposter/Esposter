import type { StampEntry } from "#src/models/fleet/data/StampEntry";

import { stampEntrySchema } from "#src/models/fleet/data/StampEntry";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One line of a peer's stamps, checked before its stamp is trusted to decide what is copied
export const parseStampEntry = (line: string): StampEntry => {
  const result = stampEntrySchema.safeParse(parseMachineJson(line));
  if (!result.success) throw new InvalidOperationError(Operation.Read, "stamp", "the peer's stamp line is malformed");
  return result.data;
};
