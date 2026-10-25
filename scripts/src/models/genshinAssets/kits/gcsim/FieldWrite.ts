import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

// One write to a `c.<field>` of a character's package: its value when it is a literal number, or no value for an
// Increment, a compound `op=` or any other write
export interface FieldWrite {
  file: string;
  line: number;
  value?: GoValue;
}
