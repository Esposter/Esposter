import { ClickerType } from "@/models/clicker/ClickerType";

export const NameMap = {
  [ClickerType.Default]: "Piña Colada",
  [ClickerType.Physical]: "Strength",
  [ClickerType.Magical]: "Mana",
} satisfies Record<ClickerType, string>;
