import type { ItemCount } from "#src/models/inventory/ItemCount";

// A one-time domain gives its reward on the first clear only: a clear of a domain not yet cleared gives the rewards it
// Draws and keeps the domain cleared, and a repeat clear gives nothing and leaves the cleared domains as they are
export const claimFirstClearReward = (
  clearedDomainIds: ReadonlySet<string>,
  domainId: string,
  rewards: ItemCount[],
): { clearedDomainIds: ReadonlySet<string>; rewards: ItemCount[] } =>
  clearedDomainIds.has(domainId)
    ? { clearedDomainIds, rewards: [] }
    : { clearedDomainIds: new Set([...clearedDomainIds, domainId]), rewards };
