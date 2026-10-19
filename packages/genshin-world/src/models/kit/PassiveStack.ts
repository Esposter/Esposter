import type { Attribute } from "#src/models/character/Attribute";

export interface PassiveStack {
  // The seconds a passive waits after it adds a stack before it adds another, if it waits at all
  cooldownSeconds?: number;
  id: string;
  // The bonuses a passive adds on its wielder while it holds its maximum stacks, each at its full amount, if it adds any
  maximumBonuses?: { amount: number; attribute: Attribute }[];
  maximumStacks: number;
  // The bonuses each stack adds on its wielder, if it adds any
  perStackBonuses?: { amount: number; attribute: Attribute }[];
  seconds: number;
}
