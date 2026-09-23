import type { CloseSessionCommand } from "#src/models/command/CloseSessionCommand";
import type { CreateSessionCommand } from "#src/models/command/CreateSessionCommand";
import type { ForkCommand } from "#src/models/command/ForkCommand";
import type { InterruptCommand } from "#src/models/command/InterruptCommand";
import type { ListSessionsCommand } from "#src/models/command/ListSessionsCommand";
import type { PermissionVerdictCommand } from "#src/models/command/PermissionVerdictCommand";
import type { PromptCommand } from "#src/models/command/PromptCommand";
import type { ResumeAtCommand } from "#src/models/command/ResumeAtCommand";
import type { ResumeCommand } from "#src/models/command/ResumeCommand";
import type { SetModelCommand } from "#src/models/command/SetModelCommand";
import type { SetPermissionModeCommand } from "#src/models/command/SetPermissionModeCommand";
import type { SlashCommandCommand } from "#src/models/command/SlashCommandCommand";

import { closeSessionCommandSchema } from "#src/models/command/CloseSessionCommand";
import { createSessionCommandSchema } from "#src/models/command/CreateSessionCommand";
import { forkCommandSchema } from "#src/models/command/ForkCommand";
import { interruptCommandSchema } from "#src/models/command/InterruptCommand";
import { listSessionsCommandSchema } from "#src/models/command/ListSessionsCommand";
import { permissionVerdictCommandSchema } from "#src/models/command/PermissionVerdictCommand";
import { promptCommandSchema } from "#src/models/command/PromptCommand";
import { resumeAtCommandSchema } from "#src/models/command/ResumeAtCommand";
import { resumeCommandSchema } from "#src/models/command/ResumeCommand";
import { setModelCommandSchema } from "#src/models/command/SetModelCommand";
import { setPermissionModeCommandSchema } from "#src/models/command/SetPermissionModeCommand";
import { slashCommandCommandSchema } from "#src/models/command/SlashCommandCommand";
import { z } from "zod";

export type Command =
  | CloseSessionCommand
  | CreateSessionCommand
  | ForkCommand
  | InterruptCommand
  | ListSessionsCommand
  | PermissionVerdictCommand
  | PromptCommand
  | ResumeAtCommand
  | ResumeCommand
  | SetModelCommand
  | SetPermissionModeCommand
  | SlashCommandCommand;

export const commandSchema: z.ZodDiscriminatedUnion<
  [
    typeof closeSessionCommandSchema,
    typeof createSessionCommandSchema,
    typeof forkCommandSchema,
    typeof interruptCommandSchema,
    typeof listSessionsCommandSchema,
    typeof permissionVerdictCommandSchema,
    typeof promptCommandSchema,
    typeof resumeAtCommandSchema,
    typeof resumeCommandSchema,
    typeof setModelCommandSchema,
    typeof setPermissionModeCommandSchema,
    typeof slashCommandCommandSchema,
  ],
  "type"
> = z.discriminatedUnion("type", [
  closeSessionCommandSchema,
  createSessionCommandSchema,
  forkCommandSchema,
  interruptCommandSchema,
  listSessionsCommandSchema,
  permissionVerdictCommandSchema,
  promptCommandSchema,
  resumeAtCommandSchema,
  resumeCommandSchema,
  setModelCommandSchema,
  setPermissionModeCommandSchema,
  slashCommandCommandSchema,
]) satisfies z.ZodType<Command>;
