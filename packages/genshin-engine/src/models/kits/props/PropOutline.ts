import type { LatheSection } from "#src/models/kits/architecture/LatheSection";

// A prop's fitted outline as the kit draws it: the boxes of a solid kind's visual hull, or the sections of a round kind's
// Lathe about its axis, its foot at the height it stands on. The two are told apart by their keys, so a record's own
// Shape tag is not restated here
export type PropOutline =
  | { axis: readonly [number, number]; foot: number; sections: LatheSection[] }
  | { boxes: readonly (readonly number[])[] };
