import type { AchievementDefinition } from "#shared/models/achievement/AchievementDefinition";
import type { AchievementDefinitionView } from "#shared/models/achievement/AchievementDefinitionView";
import type { TRPCPath } from "#shared/models/trpc/TRPCProcedureInputs";

// One registered definition as the client holds it: its view, with the name the map parses it under
export type AchievementDefinitionEntry = AchievementDefinitionView & Pick<AchievementDefinition<TRPCPath>, "name">;
