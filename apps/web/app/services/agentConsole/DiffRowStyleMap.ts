import type { CSSProperties } from "vue";

import { DiffRowType } from "@/models/agentConsole/DiffRowType";

const ADDED_STYLE = { backgroundColor: "color-mix(in srgb, var(--ui-success) 20%, transparent)" };
const REMOVED_STYLE = { backgroundColor: "color-mix(in srgb, var(--ui-error) 20%, transparent)" };
// The palette's own success and error colours, faint enough to read the code through
export const DiffRowStyleMap = {
  [DiffRowType.Added]: { new: ADDED_STYLE, old: {} },
  [DiffRowType.Changed]: { new: ADDED_STYLE, old: REMOVED_STYLE },
  [DiffRowType.Collapsed]: { new: {}, old: {} },
  [DiffRowType.Removed]: { new: {}, old: REMOVED_STYLE },
  [DiffRowType.Unchanged]: { new: {}, old: {} },
} as const satisfies Record<DiffRowType, { new: CSSProperties; old: CSSProperties }>;
