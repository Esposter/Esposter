export enum SkillDocsFindingType {
  // A skill named bare in front of its page or heading, which reads as any backticked token
  BareSkillCitation = "bare skill citation",
  // A SKILL.md past the size at which its topics should have separated
  Budget = "budget",
  // A page ending on a colon, the lead-in of an example or a list a split left on another page
  DanglingLeadIn = "dangling lead-in",
  // A description longer than the listing shows, so its tail is advertised to nobody
  DescriptionCap = "description cap",
  // A description that does not open on its trigger, which a truncated listing cuts off first
  DescriptionOpening = "description opening",
  // A `/docs/` route named outside the two skills that teach the route forms
  DocsRoute = "docs route",
  // A bare "see below" or "(above)", which names no target a reader can grep and breaks the day either half moves
  PositionalPointer = "positional pointer",
  // A reference page citing itself, which is a moved block's pointer left behind
  SelfCitation = "self citation",
  // A settled list that is not its SKILL.md's first section under the one heading, or one on a reference page
  SettledOrder = "settled order",
  // A reference page that opens on a heading, so it names no trigger for the reader who arrived by search
  Triggerless = "triggerless",
  // A reference page its own SKILL.md never indexes, so nothing loads it
  Unindexed = "unindexed",
  // A `references/…` citation resolving to no file
  Unresolved = "unresolved",
}

export const SkillDocsFindingTypes: readonly SkillDocsFindingType[] = Object.values(SkillDocsFindingType);
