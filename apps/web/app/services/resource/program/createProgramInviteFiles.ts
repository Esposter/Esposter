import type { ProgramInvite } from "#shared/models/resource/program/ProgramInvite";

import { sanitizeFilename } from "@/services/app/sanitizeFilename";
import { createProgramInviteHtml } from "@/services/resource/program/createProgramInviteHtml";

// Key values are unique per program, but sanitizing can map two of them to one name ("12/3" and "12-3"), so a name
// Already taken gets a counter rather than replacing the participant who has it
const createUniqueFileName = (keyValue: string, takenFileNames: Set<string>) => {
  const sanitizedName = sanitizeFilename(keyValue);
  let fileName = sanitizedName;
  for (let suffix = 2; takenFileNames.has(fileName); suffix += 1) fileName = `${sanitizedName}-${suffix}`;
  takenFileNames.add(fileName);
  return fileName;
};

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
