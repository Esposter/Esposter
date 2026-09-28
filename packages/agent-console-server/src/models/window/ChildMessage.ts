import type { ChildCommandErrorMessage } from "#src/models/window/ChildCommandErrorMessage";
import type { ChildCommandResultMessage } from "#src/models/window/ChildCommandResultMessage";
import type { ChildEventsMessage } from "#src/models/window/ChildEventsMessage";
import type { ChildSessionOpenMessage } from "#src/models/window/ChildSessionOpenMessage";
import type { ChildSessionsChangeMessage } from "#src/models/window/ChildSessionsChangeMessage";

import { childCommandErrorMessageSchema } from "#src/models/window/ChildCommandErrorMessage";
import { childCommandResultMessageSchema } from "#src/models/window/ChildCommandResultMessage";
import { childEventsMessageSchema } from "#src/models/window/ChildEventsMessage";
import { childSessionOpenMessageSchema } from "#src/models/window/ChildSessionOpenMessage";
import { childSessionsChangeMessageSchema } from "#src/models/window/ChildSessionsChangeMessage";
import { z } from "zod";

export type ChildMessage =
  | ChildCommandErrorMessage
  | ChildCommandResultMessage
  | ChildEventsMessage
  | ChildSessionOpenMessage
  | ChildSessionsChangeMessage;

export const childMessageSchema: z.ZodDiscriminatedUnion<
  [
    typeof childCommandErrorMessageSchema,
    typeof childCommandResultMessageSchema,
    typeof childEventsMessageSchema,
    typeof childSessionOpenMessageSchema,
    typeof childSessionsChangeMessageSchema,
  ],
  "type"
> = z.discriminatedUnion("type", [
  childCommandErrorMessageSchema,
  childCommandResultMessageSchema,
  childEventsMessageSchema,
  childSessionOpenMessageSchema,
  childSessionsChangeMessageSchema,
]) satisfies z.ZodType<ChildMessage>;
