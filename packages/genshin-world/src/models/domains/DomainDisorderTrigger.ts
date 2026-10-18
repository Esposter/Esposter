import type { Reaction } from "#src/models/combat/Reaction";

// What a triggered disorder may trigger on: a reaction an enemy took, or a change to a party member's HP
export type DomainDisorderTrigger =
  | { healthShare: number; kind: "healthChange" }
  | { kind: "reaction"; reactions: readonly Reaction[] };
