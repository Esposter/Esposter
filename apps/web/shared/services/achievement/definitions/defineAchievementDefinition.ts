import type { AchievementDefinition } from "#shared/models/achievement/AchievementDefinition";
import type { TRPCPath, TRPCProcedureInputs } from "#shared/models/trpc/TRPCProcedureInputs";
import type { Except } from "type-fest";
import type { z } from "zod";

// The category comes from the map this definition is declared in (defineAchievementDefinitionMap). The input schema
// Is constrained to the trigger's input type, and the condition receives what that schema parses, so a predicate is
// Typed by the procedure that triggers it
export const defineAchievementDefinition = <
  TPath extends TRPCPath,
  TSchema extends z.ZodType<TRPCProcedureInputs[TPath]>,
>(
  definition: Except<AchievementDefinition<TPath>, "category" | "inputSchema" | "name"> & {
    condition?: (input: z.output<TSchema>) => boolean;
    inputSchema: TSchema;
  },
) => ({
  ...definition,
  // A call the schema rejects is not an unlock. The trigger only reaches here after tRPC accepted the call, so this is
  // The same schema applied to the raw input the plugin was handed
  check: (rawInput: unknown): boolean => {
    const parsedInput = definition.inputSchema.safeParse(rawInput);
    if (!parsedInput.success) return false;
    if (definition.condition === undefined) return true;
    return definition.condition(parsedInput.data);
  },
});
