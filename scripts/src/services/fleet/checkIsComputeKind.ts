import { ComputeKind } from "#src/models/fleet/ComputeKind";

// Whether a cell names a compute kind, so a row of the Phases table with any other kind fails its read
export const checkIsComputeKind = (value: string): value is ComputeKind =>
  Object.values(ComputeKind).some((kind) => kind === value);
