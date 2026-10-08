// The archive's grouping of enemies, each spelt as the game's codex table spells it, so a table read from the game
// Parses into them. Slimes and specters are Elemental Lifeforms, Treasure Hoarders and Nobushi Other Human Factions,
// And the bosses Enemies of Note
export enum EnemyFamily {
  Automatons = "CODEX_SUBTYPE_AUTOMATRON",
  ElementalLifeforms = "CODEX_SUBTYPE_ELEMENTAL",
  EnemiesOfNote = "CODEX_SUBTYPE_BOSS",
  Fatui = "CODEX_SUBTYPE_FATUI",
  Hilichurls = "CODEX_SUBTYPE_HILICHURL",
  MysticalBeasts = "CODEX_SUBTYPE_BEAST",
  OtherHumanFactions = "CODEX_SUBTYPE_HUMAN",
  TheAbyss = "CODEX_SUBTYPE_ABYSS",
}
