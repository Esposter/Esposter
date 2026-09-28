import type { BackgroundTasksCommand } from "#src/models/command/BackgroundTasksCommand";
import type { CloseSessionCommand } from "#src/models/command/CloseSessionCommand";
import type { CreateSessionCommand } from "#src/models/command/CreateSessionCommand";
import type { ForkCommand } from "#src/models/command/ForkCommand";
import type { InterruptCommand } from "#src/models/command/InterruptCommand";
import type { ListSessionsCommand } from "#src/models/command/ListSessionsCommand";
import type { PermissionVerdictCommand } from "#src/models/command/PermissionVerdictCommand";
import type { PromptCommand } from "#src/models/command/PromptCommand";
import type { ResumeAtCommand } from "#src/models/command/ResumeAtCommand";
import type { ResumeCommand } from "#src/models/command/ResumeCommand";
import type { RewindFilesCommand } from "#src/models/command/RewindFilesCommand";
import type { SetModelCommand } from "#src/models/command/SetModelCommand";
import type { SetPermissionModeCommand } from "#src/models/command/SetPermissionModeCommand";
import type { SlashCommandCommand } from "#src/models/command/SlashCommandCommand";
import type { StopTaskCommand } from "#src/models/command/StopTaskCommand";

import { backgroundTasksCommandSchema } from "#src/models/command/BackgroundTasksCommand";
import { closeSessionCommandSchema } from "#src/models/command/CloseSessionCommand";
import { createSessionCommandSchema } from "#src/models/command/CreateSessionCommand";
import { forkCommandSchema } from "#src/models/command/ForkCommand";
import { interruptCommandSchema } from "#src/models/command/InterruptCommand";
import { listSessionsCommandSchema } from "#src/models/command/ListSessionsCommand";
import { permissionVerdictCommandSchema } from "#src/models/command/PermissionVerdictCommand";
import { promptCommandSchema } from "#src/models/command/PromptCommand";
import { resumeAtCommandSchema } from "#src/models/command/ResumeAtCommand";
import { resumeCommandSchema } from "#src/models/command/ResumeCommand";
import { rewindFilesCommandSchema } from "#src/models/command/RewindFilesCommand";
import { setModelCommandSchema } from "#src/models/command/SetModelCommand";
import { setPermissionModeCommandSchema } from "#src/models/command/SetPermissionModeCommand";
import { slashCommandCommandSchema } from "#src/models/command/SlashCommandCommand";
import { stopTaskCommandSchema } from "#src/models/command/StopTaskCommand";
import { z } from "zod";

// A command the driver answers: everything the page asks of a session
export type DriverCommand =
  | BackgroundTasksCommand
  | CloseSessionCommand
  | CreateSessionCommand
  | ForkCommand
  | InterruptCommand
  | ListSessionsCommand
  | PermissionVerdictCommand
  | PromptCommand
  | ResumeAtCommand
  | ResumeCommand
  | RewindFilesCommand
  | SetModelCommand
  | SetPermissionModeCommand
  | SlashCommandCommand
  | StopTaskCommand;

export const driverCommandSchema: z.ZodDiscriminatedUnion<
  [
    typeof backgroundTasksCommandSchema,
    typeof closeSessionCommandSchema,
    typeof createSessionCommandSchema,
    typeof forkCommandSchema,
    typeof interruptCommandSchema,
    typeof listSessionsCommandSchema,
    typeof permissionVerdictCommandSchema,
    typeof promptCommandSchema,
    typeof resumeAtCommandSchema,
    typeof resumeCommandSchema,
    typeof rewindFilesCommandSchema,
    typeof setModelCommandSchema,
    typeof setPermissionModeCommandSchema,
    typeof slashCommandCommandSchema,
    typeof stopTaskCommandSchema,
  ],
  "type"
> = z.discriminatedUnion("type", [
  backgroundTasksCommandSchema,
  closeSessionCommandSchema,
  createSessionCommandSchema,
  forkCommandSchema,
  interruptCommandSchema,
  listSessionsCommandSchema,
  permissionVerdictCommandSchema,
  promptCommandSchema,
  resumeAtCommandSchema,
  resumeCommandSchema,
  rewindFilesCommandSchema,
  setModelCommandSchema,
  setPermissionModeCommandSchema,
  slashCommandCommandSchema,
  stopTaskCommandSchema,
]) satisfies z.ZodType<DriverCommand>;
