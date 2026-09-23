import type { CSSProperties } from "vue";

import { DiffRowType } from "@/models/agentConsole/DiffRowType";
// The theme's own success and error colours, faint enough to read the code through
export const DiffRowStyleMap = {
  [DiffRowType.Added]: { new: { backgroundColor: "rgba(var(--v-theme-success), 0.15)" }, old: {} },
  [DiffRowType.Changed]: {
    new: { backgroundColor: "rgba(var(--v-theme-success), 0.15)" },
    old: { backgroundColor: "rgba(var(--v-theme-error), 0.15)" },
  },
  [DiffRowType.Removed]: { new: {}, old: { backgroundColor: "rgba(var(--v-theme-error), 0.15)" } },
  [DiffRowType.Unchanged]: { new: {}, old: {} },
} as const satisfies Record<DiffRowType, { new: CSSProperties; old: CSSProperties }>;
