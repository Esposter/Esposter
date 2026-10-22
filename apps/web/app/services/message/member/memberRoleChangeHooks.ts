import { createHookRegistry } from "@/services/shared/createHookRegistry";

type MemberRoleChangeHook = (roomId: string) => void;
// Fired by the role store on every write to a member's roles — optimistic, rolled back, committed, or arriving from a
// Subscription. The room's group totals are the server's, and only a read of them is exact, so a hook re-reads rather
// Than working out a delta. Stores owning derived per-role state register here so the role store never has to import them.
export const memberRoleChangeHooks = createHookRegistry<MemberRoleChangeHook>();
