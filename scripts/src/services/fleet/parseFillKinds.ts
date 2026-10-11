import type { FillKind } from "#src/models/fleet/FillKind";

import { checkIsFillKind } from "#src/services/fleet/checkIsFillKind";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The kinds a `--kinds` list names, in the order it names them, rejecting any entry that is not a fill kind
export const parseFillKinds = (value: string): FillKind[] =>
  value.split(",").map((kind) => {
    if (checkIsFillKind(kind)) return kind;
    throw new InvalidOperationError(Operation.Read, kind, "--kinds is a comma-separated list of unit, cpu or page");
  });
