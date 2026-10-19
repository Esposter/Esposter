import type { Reaction } from "#src/models/combat/Reaction";
import type { DomainDisorderBase } from "#src/models/domains/DomainDisorderBase";

// The ley line disorders the fight models, in one table of three kinds (PROVISIONAL: the Nightsoul ones need the kits'
// Nightsoul primitive, which does not exist yet, and the rest are unmodelled, change nothing):
// - constant: a bonus on every member of the team for the whole challenge, given on enter
// - reaction: a bonus on every member when a reaction it names is triggered on an enemy, for its seconds
// - healthChange: a bonus on every member when a party member gains or loses HP, for its seconds
// A trigger inside the cooldown changes nothing. A disorder with maxStacks gives each trigger a stack of its own up to
// That limit, each stack ending on its own clock. One without restarts its bonus on each trigger
export type DomainDisorder =
  | (DomainDisorderBase & { cooldownSeconds: number; kind: "healthChange"; maxStacks?: number; seconds: number })
  | (DomainDisorderBase & {
      cooldownSeconds: number;
      kind: "reaction";
      matches: (reaction: Reaction) => boolean;
      maxStacks?: number;
      seconds: number;
    })
  | (DomainDisorderBase & { kind: "constant" });
