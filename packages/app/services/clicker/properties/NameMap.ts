import { ClickerType } from "@/models/clicker/data/ClickerType";

export const NameMap = {
  [ClickerType.Default]: "Piña Colada",
  [ClickerType.Magical]: "Mana",
  [ClickerType.Physical]: "Strength",
} as const satisfies Record<ClickerType, string>;
