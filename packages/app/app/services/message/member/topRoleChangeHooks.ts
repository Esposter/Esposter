export type TopRoleChangeHook = (roomId: string, previousTopRoleId: string, newTopRoleId: string) => void;

// Fired by the role store whenever a member's top role changes (optimistic mutations, rollbacks, and
// Subscription events all funnel through mutateMemberRoles); "" means the roleless group on either side.
// Stores owning derived per-role state (e.g. the member list group counts) register here so the role
// Store never has to import them.
export const topRoleChangeHooks: TopRoleChangeHook[] = [];
