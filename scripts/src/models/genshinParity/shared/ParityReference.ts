import type { ParityPlacement } from "#src/models/genshinParity/shared/ParityPlacement";
import type { ParityReferenceBase } from "#src/models/genshinParity/shared/ParityReferenceBase";

// A reference is a screenshot the repository commits as `<id>.webp` beside the parity page, from a wiki file or from a
// frame of a recording, named by its `source` (`references pack` commits a cut made in the scratch folder). A screen no reference records yet is pending, with the
// reason it has none: it names no image, so no run scores it and the committed report lists it as pending
export type ParityReference = ParityReferenceBase &
  (
    | { pending?: never; placement?: never; source: string; wikiTitle?: never }
    | { pending: string; placement?: never; source?: never; wikiTitle?: never }
    | { pending?: never; placement?: ParityPlacement; source?: never; wikiTitle: string }
  );
