import { ClickerType } from "#shared/models/clicker/data/ClickerType";

export const ClickerNameMap = {
  [ClickerType.Default]: "Piña Colada",
  [ClickerType.Magical]: "Mana",
  [ClickerType.Physical]: "Strength",
} as const satisfies Record<ClickerType, string>;
