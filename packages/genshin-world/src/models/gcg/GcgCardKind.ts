// The kinds of card a duel knows. Artifact, Talent and Weapon are equipped to a character, Support sits in a side's support
// Zone, Event is played and gone, and Onstage, State and Summon are the cards a skill creates on the field
export enum GcgCardKind {
  Artifact = "Artifact",
  Event = "Event",
  Onstage = "Onstage",
  State = "State",
  Summon = "Summon",
  Support = "Support",
  Talent = "Talent",
  Weapon = "Weapon",
}
