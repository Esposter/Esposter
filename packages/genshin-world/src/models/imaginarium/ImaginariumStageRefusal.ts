// A wiki enemy name a stage's join refused, and why, so no monster is ever guessed. Its monsters span other than one
// Describe Entry, which the count gives (zero when none holds the name, more than one when several do); or its describe
// Entry's codex Names no monster row the game gives base stats and curves to fight as
export type ImaginariumStageRefusal =
  | { count: number; name: string; reason: "entries" }
  | { describeId: number; name: string; reason: "codex" };
