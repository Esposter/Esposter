import { createHookRegistry } from "@/services/shared/createHookRegistry";

type TopRoleChangeHook = (roomId: string, previousTopRoleId: string | undefined, newTopRoleId: string) => void;
// Fired by the role store whenever a member's top role changes (optimistic mutations, rollbacks, and
// Subscription events all funnel through mutateMemberRoles); "" means the roleless group on either side, and
// Undefined means the previous top role was never read, so it is unknown rather than roleless.
// Stores owning derived per-role state (e.g. the member list group counts) register here so the role
// Store never has to import them.
export const topRoleChangeHooks = createHookRegistry<TopRoleChangeHook>();
