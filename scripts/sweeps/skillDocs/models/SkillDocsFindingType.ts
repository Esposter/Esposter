export enum SkillDocsFindingType {
  // A SKILL.md past the size at which its topics should have separated
  Budget = "budget",
  // A `/docs/` route named outside the two skills that teach the route forms
  DocsRoute = "docs route",
  // A reference page its own SKILL.md never indexes, so nothing loads it
  Unindexed = "unindexed",
  // A `references/…` citation resolving to no file
  Unresolved = "unresolved",
}
