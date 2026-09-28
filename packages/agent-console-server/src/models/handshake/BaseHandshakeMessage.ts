import type { HandshakeMessageType } from "#src/models/handshake/HandshakeMessageType";
import type { ItemEntityType } from "@esposter/shared";

import { z } from "zod";

export interface BaseHandshakeMessage<T extends HandshakeMessageType> extends ItemEntityType<T> {}

export const createBaseHandshakeMessageSchema = <T extends z.ZodType<HandshakeMessageType>>(
  typeSchema: T,
): z.ZodObject<{ type: T }> => z.object({ type: typeSchema });
