import type { GadgetKind, GadgetRow } from "genshin-world";

// A gadget row as the slice holds it on disk, its kind written as the enum's own value. The world's schema checks that
// Value as the slice is read, so the writer needs no runtime import of the world
export interface GadgetSliceRow extends Omit<GadgetRow, "kind"> {
  kind: `${GadgetKind}`;
}
