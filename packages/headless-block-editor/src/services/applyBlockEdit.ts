import type { LooseBlockDocument } from "#src/models/LooseBlockDocument";
import type { ApplyPatchesResult, JsonPatchOperation } from "@esposter/shared";
import type { Result } from "neverthrow";
import type { z } from "zod";

import { applyPatches, getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { err, ok } from "neverthrow";

// Applies a command's operations as one edit, then parses the patched document with the document's schema: when an operation cannot apply or the edited document is refused, the whole edit is refused and the document is unchanged
// The result is the schema's own type, so the patched document is typed by the parse rather than by a cast
export const applyBlockEdit = <TDocument>(
  schema: z.ZodType<TDocument>,
  document: LooseBlockDocument,
  operations: JsonPatchOperation[],
): Result<ApplyPatchesResult<TDocument>, Error> =>
  getResult(() => applyPatches(document, operations)).andThen(({ document: patchedDocument, inverses }) => {
    const parsedDocument = schema.safeParse(patchedDocument);
    return parsedDocument.success
      ? ok({ document: parsedDocument.data, inverses })
      : err(new InvalidOperationError(Operation.Update, "document", "is refused by its schema once edited"));
  });
