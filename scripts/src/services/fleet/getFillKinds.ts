import { FillKind } from "#src/models/fleet/FillKind";
import { parseFillKinds } from "#src/services/fleet/parseFillKinds";

// The order the fill offers them in: a unit first, then the compute queue's lanes
const ALL_FILL_KINDS: FillKind[] = [FillKind.Unit, FillKind.Cpu, FillKind.Page];

// The kinds this machine fills, in order: the `--kinds` given, else its profile's, else every kind. A kind the machine
// Cannot serve yields no entry, since each entry's own needs gate its claim
export const getFillKinds = (value: string, profileKinds: FillKind[] | undefined): FillKind[] => {
  if (value !== "") return parseFillKinds(value);
  return profileKinds ?? [...ALL_FILL_KINDS];
};
