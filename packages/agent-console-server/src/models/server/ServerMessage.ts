import type { CommandErrorMessage } from "#src/models/server/CommandErrorMessage";
import type { EventsMessage } from "#src/models/server/EventsMessage";
import type { HostStoppingMessage } from "#src/models/server/HostStoppingMessage";
import type { SessionOpenedMessage } from "#src/models/server/SessionOpenedMessage";
import type { SessionResetMessage } from "#src/models/server/SessionResetMessage";
import type { SessionsMessage } from "#src/models/server/SessionsMessage";

import { commandErrorMessageSchema } from "#src/models/server/CommandErrorMessage";
import { eventsMessageSchema } from "#src/models/server/EventsMessage";
import { hostStoppingMessageSchema } from "#src/models/server/HostStoppingMessage";
import { sessionOpenedMessageSchema } from "#src/models/server/SessionOpenedMessage";
import { sessionResetMessageSchema } from "#src/models/server/SessionResetMessage";
import { sessionsMessageSchema } from "#src/models/server/SessionsMessage";
import { z } from "zod";

export type ServerMessage =
  | CommandErrorMessage
  | EventsMessage
  | HostStoppingMessage
  | SessionOpenedMessage
  | SessionResetMessage
  | SessionsMessage;

export const serverMessageSchema: z.ZodDiscriminatedUnion<
  [
    typeof commandErrorMessageSchema,
    typeof eventsMessageSchema,
    typeof hostStoppingMessageSchema,
    typeof sessionOpenedMessageSchema,
    typeof sessionResetMessageSchema,
    typeof sessionsMessageSchema,
  ],
  "type"
> = z.discriminatedUnion("type", [
  commandErrorMessageSchema,
  eventsMessageSchema,
  hostStoppingMessageSchema,
  sessionOpenedMessageSchema,
  sessionResetMessageSchema,
  sessionsMessageSchema,
]) satisfies z.ZodType<ServerMessage>;
