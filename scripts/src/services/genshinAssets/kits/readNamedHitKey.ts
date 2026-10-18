import type { KitParameter } from "genshin-world";

// The key a named hit is kept under, `<proud skill group>|<index>`, with the constellation its multiplier is read at after
// A second `|` where one is given, `2339|3|4`
export const readNamedHitKey = ({ constellation, index, proudSkillGroupId }: Extract<KitParameter, object>): string =>
  constellation === undefined ? `${proudSkillGroupId}|${index}` : `${proudSkillGroupId}|${index}|${constellation}`;
