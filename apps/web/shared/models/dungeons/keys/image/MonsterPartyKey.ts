export const MonsterPartyKey = {
  MonsterDetailsBackground: "MonsterDetailsBackground",
  MonsterPartyBackground: "MonsterPartyBackground",
} as const;
export type MonsterPartyKey = (typeof MonsterPartyKey)[keyof typeof MonsterPartyKey];
