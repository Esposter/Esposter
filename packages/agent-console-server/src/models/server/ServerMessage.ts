import type { AuthenticatedMessage } from "#src/models/server/AuthenticatedMessage";
import type { CommandErrorMessage } from "#src/models/server/CommandErrorMessage";
import type { EventsMessage } from "#src/models/server/EventsMessage";
import type { HostStoppingMessage } from "#src/models/server/HostStoppingMessage";
import type { PairedMessage } from "#src/models/server/PairedMessage";
import type { ProofMessage } from "#src/models/server/ProofMessage";
import type { SessionOpenedMessage } from "#src/models/server/SessionOpenedMessage";
import type { SessionResetMessage } from "#src/models/server/SessionResetMessage";
import type { SessionsMessage } from "#src/models/server/SessionsMessage";

import { authenticatedMessageSchema } from "#src/models/server/AuthenticatedMessage";
import { commandErrorMessageSchema } from "#src/models/server/CommandErrorMessage";
import { eventsMessageSchema } from "#src/models/server/EventsMessage";
import { hostStoppingMessageSchema } from "#src/models/server/HostStoppingMessage";
import { pairedMessageSchema } from "#src/models/server/PairedMessage";
import { proofMessageSchema } from "#src/models/server/ProofMessage";
import { sessionOpenedMessageSchema } from "#src/models/server/SessionOpenedMessage";
import { sessionResetMessageSchema } from "#src/models/server/SessionResetMessage";
import { sessionsMessageSchema } from "#src/models/server/SessionsMessage";
import { z } from "zod";

export type ServerMessage =
  | AuthenticatedMessage
  | CommandErrorMessage
  | EventsMessage
  | HostStoppingMessage
  | PairedMessage
  | ProofMessage
  | SessionOpenedMessage
  | SessionResetMessage
  | SessionsMessage;

export const serverMessageSchema: z.ZodDiscriminatedUnion<
  [
    typeof authenticatedMessageSchema,
    typeof commandErrorMessageSchema,
    typeof eventsMessageSchema,
    typeof hostStoppingMessageSchema,
    typeof pairedMessageSchema,
    typeof proofMessageSchema,
    typeof sessionOpenedMessageSchema,
    typeof sessionResetMessageSchema,
    typeof sessionsMessageSchema,
  ],
  "type"
> = z.discriminatedUnion("type", [
  authenticatedMessageSchema,
  commandErrorMessageSchema,
  eventsMessageSchema,
  hostStoppingMessageSchema,
  pairedMessageSchema,
  proofMessageSchema,
  sessionOpenedMessageSchema,
  sessionResetMessageSchema,
  sessionsMessageSchema,
]) satisfies z.ZodType<ServerMessage>;
