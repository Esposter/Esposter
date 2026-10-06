// What an investigation's result is to the component: a change of ours it ships, a fact about the game's data it reads,
// A search that found nothing, a change tried and turned down, or one shipped once and replaced by a later one
export enum InvestigationOutcome {
  Adopted = "Adopted",
  DeadEnd = "DeadEnd",
  Found = "Found",
  Rejected = "Rejected",
  Superseded = "Superseded",
}
