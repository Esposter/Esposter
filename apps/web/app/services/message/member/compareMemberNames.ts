import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";

import { foldAsciiCase } from "#src/services/message/member/foldAsciiCase";
import { compareText } from "@esposter/shared";

// A room's members in the order the server pages them.
// A display name compares case-insensitively, then byte by byte, and then by id.
// It is the order a room's list and a direct message's participants read in.
export const compareMemberNames = (
  firstMember: Pick<MemberInRoom, "displayName" | "id">,
  secondMember: Pick<MemberInRoom, "displayName" | "id">,
) =>
  compareText(foldAsciiCase(firstMember.displayName), foldAsciiCase(secondMember.displayName)) ||
  compareText(firstMember.id, secondMember.id);
