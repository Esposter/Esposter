import type { CSSProperties } from "vue";

import { DiffRowType } from "@/models/agentConsole/DiffRowType";
import { ADDED_STYLE, REMOVED_STYLE } from "@/services/agentConsole/constants";

// The palette's own success and error colours, faint enough to read the code through
export const DiffRowStyleMap = {
  [DiffRowType.Added]: { new: ADDED_STYLE, old: {} },
  [DiffRowType.Changed]: { new: ADDED_STYLE, old: REMOVED_STYLE },
  [DiffRowType.Collapsed]: { new: {}, old: {} },
  [DiffRowType.Removed]: { new: {}, old: REMOVED_STYLE },
  [DiffRowType.Unchanged]: { new: {}, old: {} },
} as const satisfies Record<DiffRowType, { new: CSSProperties; old: CSSProperties }>;
