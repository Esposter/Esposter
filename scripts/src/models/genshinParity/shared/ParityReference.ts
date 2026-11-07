import type { ParityPlacement } from "#src/models/genshinParity/shared/ParityPlacement";
import type { ParityReferenceBase } from "#src/models/genshinParity/shared/ParityReferenceBase";

// A reference is a screenshot the parity manifest holds by the hash of its bytes.
// It comes from a wiki file or from a frame of a recording, and is named by its `source`, or it is our own render of a
// Fixture, named by `ownRender`, with no game frame behind it yet.
// `references pack` writes a cut made in the scratch folder into the repository.
// It is written beside its fixture's snapshot, or flat in the references folder.
// A screen no reference records yet is pending, with the reason it has none.
// It names no image, so no run scores it and the committed report lists it as pending.
export type ParityReference = ParityReferenceBase &
  (
    | { ownRender: string; pending?: never; placement?: never; source?: never; wikiTitle?: never }
    | { ownRender?: never; pending: string; placement?: never; source?: never; wikiTitle?: never }
    | { ownRender?: never; pending?: never; placement?: never; source: string; wikiTitle?: never }
    | { ownRender?: never; pending?: never; placement?: ParityPlacement; source?: never; wikiTitle: string }
  );
