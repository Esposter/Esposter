export const MonsterKey = {
  Carnodusk: "Carnodusk",
  Iguanignite: "Iguanignite",
} as const;
export type MonsterKey = keyof typeof MonsterKey;
