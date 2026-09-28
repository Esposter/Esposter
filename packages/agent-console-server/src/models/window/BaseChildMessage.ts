import type { ChildMessageType } from "#src/models/window/ChildMessageType";
import type { ItemEntityType } from "@esposter/shared";

import { z } from "zod";

export interface BaseChildMessage<T extends ChildMessageType> extends ItemEntityType<T> {}

export const createBaseChildMessageSchema = <T extends z.ZodType<ChildMessageType>>(
  typeSchema: T,
): z.ZodObject<{ type: T }> => z.object({ type: typeSchema });
