import { ClickerType } from "@/models/clicker/ClickerType";

export const PluralNameMap = {
  [ClickerType.Default]: "Piña Coladas",
  [ClickerType.Physical]: "Strength",
  [ClickerType.Magical]: "Mana",
} satisfies Record<ClickerType, string>;
