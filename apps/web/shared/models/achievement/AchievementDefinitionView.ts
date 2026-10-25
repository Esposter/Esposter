import type { AchievementDefinition } from "#shared/models/achievement/AchievementDefinition";
import type { TRPCPath } from "#shared/models/trpc/TRPCProcedureInputs";

// The definition as the client receives it: the trigger's input schema stays on the server, and the name is the map's key
export type AchievementDefinitionView = Omit<AchievementDefinition<TRPCPath>, "inputSchema" | "name">;
