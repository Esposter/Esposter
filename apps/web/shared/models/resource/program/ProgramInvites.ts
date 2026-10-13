import type { ProgramInvite } from "#shared/models/resource/program/ProgramInvite";

// The bound email's compiled html and one invite per participant the scope selects, each already paired with the
// Audience row its merge fields fill from. A participant with no audience row within the read limit is counted,
// Not sent, since an invite with unfilled merge fields is worse than none
export interface ProgramInvites {
  emailHtml: string;
  invites: ProgramInvite[];
  unmatchedCount: number;
}
