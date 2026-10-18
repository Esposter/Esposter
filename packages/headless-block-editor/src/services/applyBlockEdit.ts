import type { BlockDocument } from "#src/models/BlockDocument";
import type { ApplyPatchesResult, JsonPatchOperation } from "@esposter/shared";
import type { Result } from "neverthrow";

import { applyPatches, getResult } from "@esposter/shared";

// Applies a command's operations as one edit: when any one cannot apply, the whole edit is refused and the document is unchanged
export const applyBlockEdit = (
  document: BlockDocument,
  operations: JsonPatchOperation[],
): Result<ApplyPatchesResult<BlockDocument>, Error> => getResult(() => applyPatches(document, operations));
