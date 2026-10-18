import type { AttackTag } from "#src/models/combat/AttackTag";

// The wiki's Blunt Attacks table, read by character and action, for the characters whose hits the rules would misread.
// Provisional: true where the table lists the action's abilities as blunt, false where it names an exception the rules
// Would otherwise make blunt. An action is every hit it carries, so an ability blunt for only some of an action's hits
// Is not split here.
// Not mapped: Kinich's mid-air normal attack (his record holds no normal attack), Chiori's Sode Coordinated Attack (one of
// Her skill's hits), Candace's Guardian Stance 2-Hit and Cyno's Converted Normal Attack 3-Hit and 5-Hit, which are blunt
// Only at their stance's place in the combo that an action does not split, and Gorou's Crystal Collapse, a field's tick
// And not one of his action's hits. Neuvillette's and Wanderer's plunges are catalyst plunges, which the wiki does not list
// As blunt, so the rules leave them non-blunt.
export const BluntActionMap: Partial<Record<number, Partial<Record<AttackTag, boolean>>>> = {
  // Candace: her skill
  10_000_072: { ElementalSkill: true },
  // Chiori: her normal attack, skill and burst
  10_000_094: { ElementalBurst: true, ElementalSkill: true, NormalAttack: true },
  // Chongyun: his skill and burst
  10_000_036: { ElementalBurst: true, ElementalSkill: true },
  // Eula: her skill and burst
  10_000_051: { ElementalBurst: true, ElementalSkill: true },
  // Gorou: his skill and burst are blunt, his Charged Attack is an exception
  10_000_055: { ChargedAttack: false, ElementalBurst: true, ElementalSkill: true },
  // Klee: her normal and charged attacks (Kaboom) and her skill (Jumpy Dumpty)
  10_000_029: { ChargedAttack: true, ElementalSkill: true, NormalAttack: true },
  // Ningguang: her plunge is an exception, though it deals Geo damage
  10_000_027: { PlungingAttack: false },
  // Xilonen: her burst is blunt, her skill is an exception
  10_000_103: { ElementalBurst: true, ElementalSkill: false },
  // Yun Jin: her burst (Cliffbreaker's Banner) is blunt, her skill (Opening Flourish) is an exception
  10_000_064: { ElementalBurst: true, ElementalSkill: false },
};
