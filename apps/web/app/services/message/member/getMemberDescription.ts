import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";

// A row names the account only when the room shows it under another name, and then reads its status message after it.
// A row with neither has no description at all
export const getMemberDescription = (
  { displayName, name }: Pick<MemberInRoom, "displayName" | "name">,
  statusMessage: string,
) => [name === displayName ? "" : name, statusMessage].filter(Boolean).join(" · ") || undefined;
