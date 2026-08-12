import type { AchievementCategory } from "#shared/models/achievement/AchievementCategory";

// Every definition in a file carries the file's category, so it is supplied once here instead of on each
// Entry — which is the only thing that could ever put a Clicker-category achievement in the Post map.
// The entries are constrained to `object` rather than to a definition shape: each one is already checked
// By defineAchievementDefinition against its own triggerPath, and a constraint naming
// AchievementDefinition<TRPCPaths> resolves PropertyCondition over the whole path union, which is never
export const defineAchievementDefinitionMap = <
  TCategory extends AchievementCategory,
  TDefinitionMap extends Record<string, object>,
>(
  category: TCategory,
  definitionMap: TDefinitionMap,
) =>
  Object.fromEntries(
    // Category is assigned last so an entry carrying one cannot outrank the map's. Object.assign rather than a
    // Spread because the entry value is generic, and TypeScript rejects spreading it (TS2698)
    // oxlint-disable-next-line prefer-object-spread
    Object.entries(definitionMap).map(([name, definition]) => [name, Object.assign({}, definition, { category })]),
  ) as { [P in keyof TDefinitionMap]: { category: TCategory } & TDefinitionMap[P] };
