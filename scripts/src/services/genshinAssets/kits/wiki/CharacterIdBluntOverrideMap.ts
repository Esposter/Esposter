import type { KitBluntOverride } from "#src/models/genshinAssets/kits/KitBluntOverride";

// The wiki's Blunt Attacks table for the abilities the blunt rules do not settle, by character: the flag of each action
// Its exceptions name, and of a hit where the table splits an action. The rules make a claymore's normal and charged
// Attacks, a melee weapon's plunges and Geo damage blunt, so each entry is an ability the table lists the rules miss or
// Excepts from them. Candace's Guardian Stance 2-Hit is the Normal Attack 2-Hit row, the second normal attack's hit.
// Neuvillette's Charged Attack is blunt by the talent's own table, which the wiki's list does not reach.
export const CharacterIdBluntOverrideMap: Partial<Record<number, KitBluntOverride>> = {
  // Ningguang: her plunge is an exception, though it deals Geo damage
  10_000_027: { actions: { PlungingAttack: false } },
  // Klee: her normal and charged attacks (Kaboom) and her skill (Jumpy Dumpty)
  10_000_029: { actions: { ChargedAttack: true, ElementalSkill: true, NormalAttack: true } },
  // Chongyun: his skill and burst
  10_000_036: { actions: { ElementalBurst: true, ElementalSkill: true } },
  // Eula: her skill and burst
  10_000_051: { actions: { ElementalBurst: true, ElementalSkill: true } },
  // Gorou: his skill and burst are blunt, his Charged Attack is an exception
  10_000_055: { actions: { ChargedAttack: false, ElementalBurst: true, ElementalSkill: true } },
  // Yun Jin: her burst (Cliffbreaker's Banner) is blunt, her skill (Opening Flourish) is an exception
  10_000_064: { actions: { ElementalBurst: true, ElementalSkill: false } },
  // Candace: her skill, and her Guardian Stance 2-Hit, the second normal attack's hit
  10_000_072: { actions: { ElementalSkill: true }, hits: { "normalAttacks.1.hits.0": true } },
  // Neuvillette: her Charged Attack
  10_000_087: { actions: { ChargedAttack: true } },
  // Chiori: her skill and burst are blunt, her normal attack is not, as the wiki's Weaving Blade carries no blunt flag
  10_000_094: { actions: { ElementalBurst: true, ElementalSkill: true, NormalAttack: false } },
  // Xilonen: her burst is blunt, her skill is an exception
  10_000_103: { actions: { ElementalBurst: true, ElementalSkill: false } },
};
