// What a duel did with one action: done, or the rule's reason for refusing it, which leaves the duel as it was
export enum GcgActionResult {
  Done = "Done",
  Frozen = "Frozen",
  ReplacementPending = "ReplacementPending",
  Unavailable = "Unavailable",
  Unpayable = "Unpayable",
  WrongPhase = "WrongPhase",
  WrongSide = "WrongSide",
}
