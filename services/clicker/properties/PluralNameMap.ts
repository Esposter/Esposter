import { ClickerType } from "@/models/clicker/data/ClickerType";

export const PluralNameMap = {
  [ClickerType.Default]: "Piña Coladas",
  [ClickerType.Physical]: "Strength",
  [ClickerType.Magical]: "Mana",
} as const satisfies Record<ClickerType, string>;
