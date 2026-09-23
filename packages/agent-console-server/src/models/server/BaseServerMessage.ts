import type { ServerMessageType } from "#src/models/server/ServerMessageType";
import type { ItemEntityType } from "@esposter/shared";

import { z } from "zod";

export interface BaseServerMessage<T extends ServerMessageType> extends ItemEntityType<T> {}

export const createBaseServerMessageSchema = <T extends z.ZodType<ServerMessageType>>(
  typeSchema: T,
): z.ZodObject<{ type: T }> => z.object({ type: typeSchema });
