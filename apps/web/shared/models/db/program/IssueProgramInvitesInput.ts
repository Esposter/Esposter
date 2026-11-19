import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { ProgramInviteScope } from "#shared/models/resource/program/ProgramInviteScope";
import { z } from "zod";

export const issueProgramInvitesInputSchema = z.object({
  ...resourceIdInputSchema.shape,
  scope: z.enum(ProgramInviteScope),
});
export type IssueProgramInvitesInput = z.infer<typeof issueProgramInvitesInputSchema>;
