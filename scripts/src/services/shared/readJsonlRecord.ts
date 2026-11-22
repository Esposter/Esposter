import type { z } from "zod";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";

// One line of a JSON Lines file parsed by its schema. A line that is not one record throws, naming where it sits
export const readJsonlRecord = <T>(text: string, location: string, schema: z.ZodType<T>): T =>
  getResult(() => schema.parse(parseMachineJson(text))).match(
    (record) => record,
    (error) => {
      throw new InvalidOperationError(Operation.Read, location, error.message);
    },
  );
