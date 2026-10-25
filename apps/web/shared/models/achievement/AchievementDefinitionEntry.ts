import type { AchievementDefinition } from "#shared/models/achievement/AchievementDefinition";
import type { TRPCPath } from "#shared/models/trpc/TRPCProcedureInputs";
import type { Except } from "type-fest";

// One registered definition as the client holds it: the definition without the trigger's input schema
export type AchievementDefinitionEntry = Except<AchievementDefinition<TRPCPath>, "inputSchema">;
