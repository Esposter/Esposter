import { ClickerType } from "@/models/clicker/data/ClickerType";

export const NameMap = {
  [ClickerType.Default]: "Piña Colada",
  [ClickerType.Physical]: "Strength",
  [ClickerType.Magical]: "Mana",
} as const satisfies Record<ClickerType, string>;
