import type { ProgramInvite } from "#shared/models/resource/program/ProgramInvite";

import { sanitizeFilename } from "@/services/app/sanitizeFilename";
import { createProgramInviteHtml } from "@/services/resource/program/createProgramInviteHtml";

// One file per participant, named after their key value. Key values are unique per program, so no two collide
export const createProgramInviteFiles = (emailHtml: string, surveyPath: string, invites: ProgramInvite[]) =>
  Object.fromEntries(
    invites.map((invite) => [
      sanitizeFilename(invite.keyValue),
      createProgramInviteHtml(emailHtml, surveyPath, invite),
    ]),
  );
