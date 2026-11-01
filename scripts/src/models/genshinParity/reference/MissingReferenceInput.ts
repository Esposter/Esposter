import type { MissingReferenceInputKind } from "#src/models/genshinParity/reference/MissingReferenceInputKind";

// An input a reference's comparison reads from disk that is not there yet, with its kind and the path it is expected at
export interface MissingReferenceInput {
  kind: MissingReferenceInputKind;
  path: string;
}
