import type { KeyedView } from "#src/models/shared/overlay/KeyedView";

// A pure change over held state, applied to a keyed view. Its result is discarded, since the view recomputes it
export type Entry = (view: KeyedView) => void;
