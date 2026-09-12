import type { InviteInMessage } from "@esposter/db-schema";

import { RoutePath } from "@esposter/shared";

// The absolute link a member hands to someone outside the room, which is the one form both the manager and the
// Invite table copy.
export const getInviteLink = (baseUrl: string, inviteId: InviteInMessage["id"]): string =>
  `${baseUrl}${RoutePath.MessagesInvite(inviteId)}`;
