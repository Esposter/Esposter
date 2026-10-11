import { FillKind } from "#src/models/fleet/FillKind";

// Whether a `--kinds` entry names a kind of fill
export const checkIsFillKind = (value: string): value is FillKind =>
  Object.values(FillKind).some((fillKind) => fillKind === value);
