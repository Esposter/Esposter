import { ClickerType } from "@/models/clicker/data/ClickerType";

export const PluralNameMap = {
  [ClickerType.Default]: "Piña Coladas",
  [ClickerType.Magical]: "Mana",
  [ClickerType.Physical]: "Strength",
} as const satisfies Record<ClickerType, string>;
