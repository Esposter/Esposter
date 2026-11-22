import { EnemyKindId } from "genshin-world";

// The member of EnemyKindId a kind is written as, the name the object gives its id
export const toEnemyKindIdMember = (kindId: EnemyKindId): string => {
  const [member] = Object.entries(EnemyKindId).find(([, id]) => id === kindId) ?? [];
  return member ?? String(kindId);
};
