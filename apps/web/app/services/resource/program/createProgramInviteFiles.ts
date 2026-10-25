import type { ProgramInvite } from "#shared/models/resource/program/ProgramInvite";

import { createProgramInviteHtml } from "@/services/resource/program/createProgramInviteHtml";
import { createUniqueFileName } from "@/services/resource/program/createUniqueFileName";

// One file per participant, named after their key value
export const createProgramInviteFiles = (emailHtml: string, surveyPath: string, invites: ProgramInvite[]) => {
  const takenFileNames = new Set<string>();
  return Object.fromEntries(
    invites.map((invite) => [
      createUniqueFileName(invite.keyValue, takenFileNames),
      createProgramInviteHtml(emailHtml, surveyPath, invite),
    ]),
  );
};
