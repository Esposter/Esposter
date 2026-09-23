import type { CommandErrorMessage } from "#src/models/server/CommandErrorMessage";
import type { EventsMessage } from "#src/models/server/EventsMessage";
import type { SessionOpenedMessage } from "#src/models/server/SessionOpenedMessage";
import type { SessionResetMessage } from "#src/models/server/SessionResetMessage";
import type { SessionsMessage } from "#src/models/server/SessionsMessage";

import { commandErrorMessageSchema } from "#src/models/server/CommandErrorMessage";
import { eventsMessageSchema } from "#src/models/server/EventsMessage";
import { sessionOpenedMessageSchema } from "#src/models/server/SessionOpenedMessage";
import { sessionResetMessageSchema } from "#src/models/server/SessionResetMessage";
import { sessionsMessageSchema } from "#src/models/server/SessionsMessage";
import { z } from "zod";

export type ServerMessage =
  | CommandErrorMessage
  | EventsMessage
  | SessionOpenedMessage
  | SessionResetMessage
  | SessionsMessage;

export const serverMessageSchema: z.ZodDiscriminatedUnion<
  [
    typeof commandErrorMessageSchema,
    typeof eventsMessageSchema,
    typeof sessionOpenedMessageSchema,
    typeof sessionResetMessageSchema,
    typeof sessionsMessageSchema,
  ],
  "type"
> = z.discriminatedUnion("type", [
  commandErrorMessageSchema,
  eventsMessageSchema,
  sessionOpenedMessageSchema,
  sessionResetMessageSchema,
  sessionsMessageSchema,
]) satisfies z.ZodType<ServerMessage>;
