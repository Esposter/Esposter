export const InjectionKeyMap = {
  SceneKey: Symbol("SceneKey"),
  ParentContainer: Symbol("ParentContainer"),
} as const satisfies Record<string, symbol>;
