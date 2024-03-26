export const MonsterPartyKey = {
  MonsterDetailsBackground: "MonsterDetailsBackground",
  MonsterPartyBackground: "MonsterPartyBackground",
} as const;
export type MonsterPartyKey = keyof typeof MonsterPartyKey;
