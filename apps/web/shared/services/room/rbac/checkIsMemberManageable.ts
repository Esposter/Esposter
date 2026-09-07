import type { RoomMemberAuthority } from "#shared/models/room/RoomMemberAuthority";

import { checkIsManageable } from "#shared/services/room/rbac/checkIsManageable";

// Targeting a member is the role comparison plus owner immunity, and the immunity cannot be left to position:
// The owner holds no role row at all, so their top position is the floor every assigned role beats. Ranked on
// Position alone the owner would be the most manageable member of their own room rather than the one member
// Only they may act on — a room has exactly one owner, so `actor.isOwner` on an owner target is the owner
// Themselves, which is what keeps an owner able to give themselves a role
export const checkIsMemberManageable = (actor: RoomMemberAuthority, target: RoomMemberAuthority): boolean =>
  target.isOwner ? actor.isOwner : checkIsManageable(actor.topPosition, target.topPosition, actor.isOwner);
