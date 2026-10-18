import type { AttackTag } from "#src/models/combat/AttackTag";

// The wiki's Blunt Attacks table (fandom "Blunt Attack", its full list and exceptions), read by character and action
// For the characters whose hits the rules would misread. Provisional: true where the table lists the action's abilities
// As blunt, false where it names an exception the rules would otherwise make blunt. An action is every hit it carries,
// So an ability blunt for only some of an action's hits is not split here.
// Not mapped: Kinich's mid-air normal attack (his record holds no normal attack), Chiori's Sode Coordinated Attack
// (inside her skill's hits), Traveler's skill (its element is taken from the wielder and removed at build, so its
// Geo form reads physical), and the table's rows for characters not listed here.
export const BluntActionMap: Partial<Record<number, Partial<Record<AttackTag, boolean>>>> = {
  // Chiori: Hiyoku: Twin Blades (normal attack), Fluttering Hasode (skill), A Tailor's Three Courtesies (burst)
  10_000_094: { ElementalBurst: true, ElementalSkill: true, NormalAttack: true },
  // Gorou: Inuzaka All-Round Defense (skill), Juuga: Forward Unto Victory Activation DMG (burst).
  // His Charged Attack is an exception. His Crystal Collapse, the other exception, is a field's tick and not one of
  // The action's hits.
  10_000_055: { ChargedAttack: false, ElementalBurst: true, ElementalSkill: true },
  // Klee: Kaboom! (normal and charged attacks), Jumpy Dumpty Bounce DMG (skill, whose hits are its bounces)
  10_000_029: { ChargedAttack: true, ElementalSkill: true, NormalAttack: true },
  // Ningguang: her Plunging Attack (Sparkling Scatter) is an exception
  10_000_027: { PlungingAttack: false },
  // Xilonen: Ehecatl's Roar and Ocelotlicue Point!, which the record gives as its burst (unverified which name it is).
  // Yohual's Scratch, her skill, is an exception
  10_000_103: { ElementalBurst: true, ElementalSkill: false },
  // Yun Jin: Cliffbreaker's Banner (burst). Opening Flourish (skill) is an exception
  10_000_064: { ElementalBurst: true, ElementalSkill: false },
};
