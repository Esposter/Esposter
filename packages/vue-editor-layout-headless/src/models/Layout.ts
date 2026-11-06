import type { Panel } from "#src/models/Panel";
import type { Region } from "#src/models/Region";

// An editor's layout as plain data. The canvas is the window's remaining space: every layout has exactly one, and it is never omitted
export interface Layout {
  canvasId: string;
  panels: Panel[];
  regions: Region[];
}
