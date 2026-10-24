import { ProgramInviteScope } from "#shared/models/resource/program/ProgramInviteScope";
import { sanitizeFilename } from "@/services/app/sanitizeFilename";

// Named after the program and after which of its two exports the owner is making, invites or reminders
export const getProgramInviteFilename = (resourceName: string, scope: ProgramInviteScope) =>
  `${sanitizeFilename(resourceName)}-${scope === ProgramInviteScope.Awaiting ? "reminders" : "invites"}`;
