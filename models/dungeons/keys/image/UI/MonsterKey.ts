export const MonsterKey = {
  Aquavalor: "Aquavalor",
  Carnodusk: "Carnodusk",
  Frostsaber: "Frostsaber",
  Ignivolt: "Ignivolt",
  Iguanignite: "Iguanignite",
} as const;
export type MonsterKey = keyof typeof MonsterKey;
