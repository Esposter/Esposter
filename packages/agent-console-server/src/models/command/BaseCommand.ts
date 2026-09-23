import type { CommandType } from "#src/models/command/CommandType";
import type { ItemEntityType } from "@esposter/shared";

import { z } from "zod";

export interface BaseCommand<T extends CommandType> extends ItemEntityType<T> {
  // Chosen by the page, and echoed on the reply so a reply finds the command that caused it
  id: string;
}

export const createBaseCommandSchema = <T extends z.ZodType<CommandType>>(
  typeSchema: T,
): z.ZodObject<{ id: z.ZodString; type: T }> => z.object({ id: z.string().min(1), type: typeSchema });
