import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { JsonPatchOperation } from "@esposter/shared";

import { positionedDocumentSchema } from "#src/models/PositionedDocument";
import { applyBlockEdit } from "#src/services/applyBlockEdit";
import { describe } from "vitest";

// A positioned edit applied as one edit: the patched document, or undefined when the edit is refused
export const applyPositionedEdit = (
  document: PositionedDocument,
  operations: JsonPatchOperation[],
): PositionedDocument | undefined =>
  applyBlockEdit(positionedDocumentSchema, document, operations).match(
    ({ document: patchedDocument }) => patchedDocument,
    () => undefined,
  );

describe.todo("positionedEdit");
