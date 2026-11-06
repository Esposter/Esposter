import type { ReaderState } from "#src/models/ReaderState";
import type { ResolvedLayout } from "#src/models/ResolvedLayout";
import type { ComputedRef } from "vue";

// What an editor's layout answers: its reader's state, which only the functions beside it change, and the layout resolved for the
// Present context. Each function is named by the id of the region or panel it changes
export interface EditorLayout {
  readerState: ComputedRef<ReaderState>;
  resizeRegion: (regionId: string, size: number) => void;
  resolvedLayout: ComputedRef<ResolvedLayout>;
  setActivePanel: (regionId: string, panelId: string) => void;
  toggleRegion: (regionId: string) => void;
}
