import { ClickerType } from "#shared/models/clicker/data/ClickerType";

export const ClickerColorMap = {
  [ClickerType.Default]: "var(--ui-accent)",
  [ClickerType.Magical]: "var(--ui-info)",
  [ClickerType.Physical]: "var(--ui-error)",
} as const satisfies Record<ClickerType, string>;
