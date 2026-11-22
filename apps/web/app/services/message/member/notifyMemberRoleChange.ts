import { memberRoleChangeHooks } from "#src/services/message/member/memberRoleChangeHooks";

// The room's derived totals are re-read through the registered hooks, since only the server's totals say what a
// Role-membership change did. Two things fire them: a refresh of the room's roles, which a write to a member's roles
// Brings about by the topic the server infers for it and the refresh watches, and a member leaving the room. A read
// Of one member's roles does not, its counts the server already includes
export const notifyMemberRoleChange = (roomId: string) => {
  for (const memberRoleChangeHook of memberRoleChangeHooks.hooks) memberRoleChangeHook(roomId);
};
