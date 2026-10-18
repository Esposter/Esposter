// A character's skills by the tag the card gives them: the normal attack, the elemental skill and the elemental burst, and
// The passive a character holds, which no action uses and only its skill rules read, and the Technique a card gives the
// Character it is equipped to, a combat action of its own that no skill rule counts as a skill
export enum GcgSkillKind {
  ElementalBurst = "ElementalBurst",
  ElementalSkill = "ElementalSkill",
  NormalAttack = "NormalAttack",
  Passive = "Passive",
  Technique = "Technique",
}
