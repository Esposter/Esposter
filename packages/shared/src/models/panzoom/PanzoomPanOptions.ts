import type { PanzoomOptions } from "#src/models/panzoom/PanzoomOptions";

// The options one pan call takes over the instance's, where force lets the call pan through disablePan and panOnlyWhenZoomed
export interface PanzoomPanOptions extends PanzoomOptions {
  force?: boolean;
}
